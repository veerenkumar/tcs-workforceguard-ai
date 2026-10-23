def test_health_check(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_current_dataset(client):
    res = client.get("/api/v1/datasets/current")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] >= 1000
    assert data["target_column_found"] is True

def test_dashboard_analytics(client):
    res = client.get("/api/v1/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_employees"] >= 1000
    assert "kpi_cards" in data
    assert len(data["department_metrics"]) > 0

def test_root_cause(client):
    res = client.get("/api/v1/root-cause")
    assert res.status_code == 200
    data = res.json()
    assert "statistical_drivers" in data
    assert len(data["statistical_drivers"]) > 0

def test_interventions_crud(client):
    # List interventions
    res = client.get("/api/v1/interventions")
    assert res.status_code == 200
    initial_count = len(res.json())

    # Create new
    payload = {
        "title": "On-Demand Mental Health & Burnout Sabbatical",
        "department": "Technology & Engineering",
        "target_cohort": "Engineers with Overtime > 30 hrs",
        "risk_factor": "Overtime Burnout",
        "description": "Provide 10-day paid wellness rest break for critical release engineers.",
        "policy_category": "Workplace Well-being",
        "estimated_cost_inr": 750000.0,
        "projected_retention_lift_pct": 20.0,
        "target_headcount": 45
    }
    create_res = client.post("/api/v1/interventions", json=payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["title"] == payload["title"]
    assert created["status"] == "Proposed"

    # Patch status
    patch_res = client.patch(f"/api/v1/interventions/{created['id']}", json={"status": "Active"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Active"

def test_roi_modeler(client):
    payload = {
        "cohort_headcount": 100,
        "avg_annual_salary_inr": 1200000.0,
        "current_attrition_rate_pct": 25.0,
        "target_attrition_reduction_pct": 25.0,
        "intervention_cost_inr": 1500000.0,
        "replacement_cost_multiplier": 1.5
    }
    res = client.post("/api/v1/interventions/roi-model", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["gross_replacement_savings_inr"] > 0
    assert data["roi_multiple"] > 1.0

def test_ai_assistant_chat(client):
    res = client.post("/api/v1/assistant/chat", json={
        "message": "Compare attrition rates across departments and show me who has the most overtime."
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 50
    assert len(data["tools_called"]) > 0
    assert data["tools_called"][0]["tool_name"] == "compare_departments"
