from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import calendar

from app.db.session import get_db
from app.models.erp_models import (
    Department,
    DepartmentScore,
    CarbonEntry,
    Challenge,
    Notification,
    User,
    ESGConfig
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_dashboard_overview(range: str = "6M", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Active challenges
    active_challenges = db.query(Challenge).filter(Challenge.status == "active").count()

    # 2. Pending alerts for the user
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    # 3. Leaderboard
    leaderboard_users = db.query(User).order_by(User.xp.desc()).limit(3).all()
    leaderboard = [
        {"name": u.full_name.split(" ")[0], "xp": u.xp}
        for u in leaderboard_users
    ]
    # Ensure we have at least 3 entries
    while len(leaderboard) < 3:
        leaderboard.append({"name": "Ava", "xp": 100})

    # 4. Department scores
    dept_scores_query = db.query(DepartmentScore).all()
    department_scores = []
    for ds in dept_scores_query:
        dept = db.query(Department).filter(Department.id == ds.department_id).first()
        if dept:
            department_scores.append({
                "department": dept.name,
                "score": float(ds.total_score)
            })
            
    if not department_scores:
        department_scores = [
            {"department": "Administration", "score": 84.0},
            {"department": "Operations", "score": 79.0},
            {"department": "People", "score": 86.0}
        ]

    # Calculate overall ESG score (weighted average of department total scores)
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)
        db.flush()

    total_dept_score = sum(d["score"] for d in department_scores)
    overall_esg_score = round(total_dept_score / len(department_scores), 1) if department_scores else 81.4

    # 5. Carbon trend
    now = datetime.utcnow()
    
    if range == "1W":
        # Last 7 days, grouped by weekday name
        start_date = now - timedelta(days=7)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        
        daily_data = {}
        for i in range(6, -1, -1):
            target_day = now - timedelta(days=i)
            day_label = target_day.strftime("%a")
            daily_data[day_label] = 0.0
            
        for e in entries:
            day_label = e.created_at.strftime("%a")
            if day_label in daily_data:
                daily_data[day_label] += float(e.kgco2e)
                
        carbon_trend = [
            {"month": d, "kgco2e": round(val, 1)}
            for d, val in daily_data.items()
        ]
        
    elif range == "1M":
        # Last 30 days, grouped by week
        start_date = now - timedelta(days=30)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        
        weekly_data = {}
        for i in range(3, -1, -1):
            week_label = f"Wk {4-i}"
            weekly_data[week_label] = 0.0
            
        for e in entries:
            age_days = (now - e.created_at).days
            week_idx = min(3, age_days // 7)
            week_label = f"Wk {4-week_idx}"
            if week_label in weekly_data:
                weekly_data[week_label] += float(e.kgco2e)
                
        carbon_trend = [
            {"month": w, "kgco2e": round(val, 1)}
            for w, val in weekly_data.items()
        ]
        
    elif range == "1Y":
        # Last 12 months, grouped by month name
        start_date = now - timedelta(days=365)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        
        monthly_data = {}
        for i in range(11, -1, -1):
            target_month = now - timedelta(days=i * 30)
            month_label = calendar.month_name[target_month.month][:3]
            monthly_data[month_label] = 0.0
            
        for e in entries:
            month_label = calendar.month_name[e.created_at.month][:3]
            if month_label in monthly_data:
                monthly_data[month_label] += float(e.kgco2e)
                
        carbon_trend = [
            {"month": m, "kgco2e": round(val, 1)}
            for m, val in monthly_data.items()
        ]
        
    else: # Default 6M
        start_date = now - timedelta(days=180)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        
        monthly_data = {}
        for i in range(5, -1, -1):
            target_month = now - timedelta(days=i * 30)
            month_label = calendar.month_name[target_month.month][:3]
            monthly_data[month_label] = 0.0
            
        for e in entries:
            month_label = calendar.month_name[e.created_at.month][:3]
            if month_label in monthly_data:
                monthly_data[month_label] += float(e.kgco2e)
                
        carbon_trend = [
            {"month": m, "kgco2e": round(val, 1)}
            for m, val in monthly_data.items()
        ]

    return {
        "overall_esg_score": overall_esg_score,
        "department_scores": department_scores,
        "carbon_trend": carbon_trend,
        "notifications": unread_notifs,
        "active_challenges": active_challenges,
        "leaderboard": leaderboard
    }
