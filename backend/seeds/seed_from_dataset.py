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
        
    # Get departments and admin user to associate entries
    dept = session.query(Department).first()
    if not dept:
        print("Error: No department found. Please seed the basic ERP structure first.")
        return
        
    admin = session.query(User).filter(User.role == "admin").first()
    if not admin:
        print("Error: No admin user found. Please seed the basic ERP structure first.")
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
    
    # We will read both 2023 and 2022 rows
    # Row range:
    # 2023 is rows 3 to 14
    # 2022 is rows 16 to 27
    
    def process_rows(start_row: int, end_row: int, year: int):
        for r in range(start_row, end_row + 1):
            row_vals = [sheet.cell(r, c).value for c in range(1, 9)]
            month = row_vals[0]
            if month is None:
                continue
                
            x1, x2, x3, x4, x5, x6, y = row_vals[1:8]
            
            # Form timestamp for this month
            # Using timezone-aware UTC datetime:
            dt = datetime(year, int(month), 15, 12, 0, tzinfo=timezone.utc)
            
            print(f"Seeding {year}-{month:02d}: x1={x1}, x2={x2}, x3={x3}, x4={x4}, x5={x5}")
            
            # Map metrics to CarbonEntries
            # x1 -> Scope 1 (Diesel Fuel)
            if x1:
                e1 = CarbonEntry(
                    user_id=admin.id,
                    department_id=dept.id,
                    activity_type="Diesel Fuel",
                    quantity=float(x1),
                    unit="liters",
                    emission_factor=float(factors["Diesel Fuel"].factor),
                    kgco2e=float(x1) * float(factors["Diesel Fuel"].factor),
                    created_at=dt
                )
                session.add(e1)
                
            # x2 -> Scope 2 (Grid Electricity)
            if x2:
                e2 = CarbonEntry(
                    user_id=admin.id,
                    department_id=dept.id,
                    activity_type="Grid Electricity",
                    quantity=float(x2),
                    unit="kWh",
                    emission_factor=float(factors["Grid Electricity"].factor),
                    kgco2e=float(x2) * float(factors["Grid Electricity"].factor),
                    created_at=dt
                )
                session.add(e2)
                
            # x3 -> Scope 3 (Employee Commute)
            if x3:
                e3 = CarbonEntry(
                    user_id=admin.id,
                    department_id=dept.id,
                    activity_type="Employee Commute",
                    quantity=float(x3),
                    unit="km",
                    emission_factor=float(factors["Employee Commute"].factor),
                    kgco2e=float(x3) * float(factors["Employee Commute"].factor),
                    created_at=dt
                )
                session.add(e3)
                
            # x4 -> Scope 3 (Supply Chain)
            if x4:
                e4 = CarbonEntry(
                    user_id=admin.id,
                    department_id=dept.id,
                    activity_type="Supply Chain",
                    quantity=float(x4),
                    unit="kg",
                    emission_factor=float(factors["Supply Chain"].factor),
                    kgco2e=float(x4) * float(factors["Supply Chain"].factor),
                    created_at=dt
                )
                session.add(e4)
                
            # x5 -> Scope 3 (Office Paper)
            if x5:
                e5 = CarbonEntry(
                    user_id=admin.id,
                    department_id=dept.id,
                    activity_type="Office Paper",
                    quantity=float(x5),
                    unit="reams",
                    emission_factor=float(factors["Office Paper"].factor),
                    kgco2e=float(x5) * float(factors["Office Paper"].factor),
                    created_at=dt
                )
                session.add(e5)
                
            # Create a corresponding OperationalRecord to represent the transaction
            rec = OperationalRecord(
                type="fleet" if x1 else "expense",
                description=f"Operational dataset log for {calendar_month(int(month))} {year}",
                department_id=dept.id,
                quantity=float(x1 or x2 or x3 or x4 or x5 or 1.0),
                unit="units",
                cost=float(y) * 1000.0 if y else 150.0,
                created_at=dt
            )
            session.add(rec)

    def calendar_month(m: int) -> str:
        import calendar
        return calendar.month_name[m]

    process_rows(3, 14, 2023)
    process_rows(16, 27, 2022)
    
    session.commit()
    print("IEEE dataset successfully seeded into database.")
    session.close()

if __name__ == "__main__":
    seed_ieee_data()
