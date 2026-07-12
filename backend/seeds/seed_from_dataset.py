import os
import sys
import openpyxl
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Resolve absolute path to the backend directory and inject it into sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "app"))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.erp_models import (
    CarbonEntry, OperationalRecord, Department, User, EmissionFactor
)

def seed_ieee_data() -> None:
    session = SessionLocal()
    
    # 1. Clean existing CarbonEntries and OperationalRecords to prevent duplicate overlay
    try:
        session.query(CarbonEntry).delete()
        session.query(OperationalRecord).delete()
        session.commit()
        print("Cleared existing carbon entries and operational records.")
    except Exception as e:
        session.rollback()
        print(f"Error during clean: {e}")
        
    # Get the four quick sandbox users dynamically
    admin = session.query(User).filter(User.email == "admin@ecosphere.local").first()
    manager = session.query(User).filter(User.email == "manager@ecosphere.local").first()
    employee = session.query(User).filter(User.email == "employee@ecosphere.local").first()
    auditor = session.query(User).filter(User.email == "auditor@ecosphere.local").first()
    
    if not all([admin, manager, employee, auditor]):
        print("Error: Could not find all four sandbox users (admin, manager, employee, auditor). Make sure to seed erp first.")
        return
        
    # Retrieve or create emission factors
    factors = {
        "Diesel Fuel": session.query(EmissionFactor).filter(EmissionFactor.activity_type == "Diesel Fuel").first(),
        "Grid Electricity": session.query(EmissionFactor).filter(EmissionFactor.activity_type == "Grid Electricity").first(),
        "Employee Commute": session.query(EmissionFactor).filter(EmissionFactor.activity_type == "Employee Commute").first(),
        "Supply Chain": session.query(EmissionFactor).filter(EmissionFactor.activity_type == "Supply Chain").first(),
        "Office Paper": session.query(EmissionFactor).filter(EmissionFactor.activity_type == "Office Paper").first()
    }
    
    # Create defaults if missing
    for key, val in factors.items():
        if not val:
            new_factor = EmissionFactor(
                name=f"{key} Factor",
                activity_type=key,
                factor=1.0 if key != "Grid Electricity" else 0.5,
                unit="liters" if "Fuel" in key else "kWh" if "Electricity" in key else "units"
            )
            session.add(new_factor)
            session.flush()
            factors[key] = new_factor
            
    session.commit()

    # Load IEEE dataset
    carbon_path = Path("c:/EcoMerge_AI/Datasets/carbon_data.xlsx")
    if not carbon_path.exists():
        print(f"CRITICAL: Dataset file not found at {carbon_path}")
        return
        
    wb = openpyxl.load_workbook(carbon_path)
    sheet = wb["Sheet3"]
    
    # Shift the years dynamically relative to the current year so that the last 6 months trendline works!
    current_year = datetime.utcnow().year
    
    def process_rows(start_row: int, end_row: int, target_year: int):
        for r in range(start_row, end_row + 1):
            row_vals = [sheet.cell(r, c).value for c in range(1, 9)]
            month = row_vals[0]
            if month is None:
                continue
                
            x1, x2, x3, x4, x5, x6, y = row_vals[1:8]
            
            # Form timestamp for this month
            dt = datetime(target_year, int(month), 15, 12, 0, tzinfo=timezone.utc)
            
            print(f"Seeding {target_year}-{month:02d}: x1={x1}, x2={x2}, x3={x3}, x4={x4}, x5={x5}")
            
            # Distribute data cleanly among the four users/departments
            
            # 1. Diesel Fuel (Scope 1) -> Manager (Operations)
            if x1:
                e1 = CarbonEntry(
                    user_id=manager.id,
                    department_id=manager.department_id,
                    activity_type="Diesel Fuel",
                    quantity=float(x1),
                    unit="liters",
                    emission_factor=float(factors["Diesel Fuel"].factor),
                    kgco2e=float(x1) * float(factors["Diesel Fuel"].factor),
                    created_at=dt
                )
                session.add(e1)
                
                # Corresponding operational transaction for Operations
                r1 = OperationalRecord(
                    type="fleet",
                    description=f"Operations fleet diesel log - {calendar_month(int(month))} {target_year}",
                    department_id=manager.department_id,
                    quantity=float(x1),
                    unit="liters",
                    cost=float(x1) * 1.45,
                    created_at=dt
                )
                session.add(r1)
                
            # 2. Grid Electricity (Scope 2) -> Admin (Administration)
            if x2:
                e2 = CarbonEntry(
                    user_id=admin.id,
                    department_id=admin.department_id,
                    activity_type="Grid Electricity",
                    quantity=float(x2),
                    unit="kWh",
                    emission_factor=float(factors["Grid Electricity"].factor),
                    kgco2e=float(x2) * float(factors["Grid Electricity"].factor),
                    created_at=dt
                )
                session.add(e2)
                
                # Corresponding operational transaction for Admin
                r2 = OperationalRecord(
                    type="expense",
                    description=f"Administration utility electric charge - {calendar_month(int(month))} {target_year}",
                    department_id=admin.department_id,
                    quantity=float(x2),
                    unit="kWh",
                    cost=float(x2) * 0.12,
                    created_at=dt
                )
                session.add(r2)
                
            # 3. Employee Commute (Scope 3) -> Employee (Operations)
            if x3:
                e3 = CarbonEntry(
                    user_id=employee.id,
                    department_id=employee.department_id,
                    activity_type="Employee Commute",
                    quantity=float(x3),
                    unit="km",
                    emission_factor=float(factors["Employee Commute"].factor),
                    kgco2e=float(x3) * float(factors["Employee Commute"].factor),
                    created_at=dt
                )
                session.add(e3)
                
                # Corresponding operational transaction for Operations (Commuting mileage claim)
                r3 = OperationalRecord(
                    type="expense",
                    description=f"Operations employee commuting claims - {calendar_month(int(month))} {target_year}",
                    department_id=employee.department_id,
                    quantity=float(x3),
                    unit="km",
                    cost=float(x3) * 0.45,
                    created_at=dt
                )
                session.add(r3)
                
            # 4. Supply Chain (Scope 3) -> Manager (Operations)
            if x4:
                e4 = CarbonEntry(
                    user_id=manager.id,
                    department_id=manager.department_id,
                    activity_type="Supply Chain",
                    quantity=float(x4),
                    unit="kg",
                    emission_factor=float(factors["Supply Chain"].factor),
                    kgco2e=float(x4) * float(factors["Supply Chain"].factor),
                    created_at=dt
                )
                session.add(e4)
                
                # Corresponding operational transaction for Operations (Purchasing cost)
                r4 = OperationalRecord(
                    type="purchase",
                    description=f"Operations supply chain carbon log - {calendar_month(int(month))} {target_year}",
                    department_id=manager.department_id,
                    quantity=float(x4),
                    unit="kg",
                    cost=float(x4) * 2.50,
                    created_at=dt
                )
                session.add(r4)
                
            # 5. Office Paper (Scope 3) -> Auditor (People / HR)
            if x5:
                e5 = CarbonEntry(
                    user_id=auditor.id,
                    department_id=auditor.department_id,
                    activity_type="Office Paper",
                    quantity=float(x5),
                    unit="reams",
                    emission_factor=float(factors["Office Paper"].factor),
                    kgco2e=float(x5) * float(factors["Office Paper"].factor),
                    created_at=dt
                )
                session.add(e5)
                
                # Corresponding operational transaction for HR (Consumables procurement cost)
                r5 = OperationalRecord(
                    type="purchase",
                    description=f"People / HR office supplies purchase - {calendar_month(int(month))} {target_year}",
                    department_id=auditor.department_id,
                    quantity=float(x5),
                    unit="reams",
                    cost=float(x5) * 5.0,
                    created_at=dt
                )
                session.add(r5)

    def calendar_month(m: int) -> str:
        import calendar
        return calendar.month_name[m]

    process_rows(3, 14, current_year)
    process_rows(16, 27, current_year - 1)
    
    session.commit()
    print("IEEE dataset successfully seeded and distributed among sandbox roles.")
    session.close()

if __name__ == "__main__":
    seed_ieee_data()
