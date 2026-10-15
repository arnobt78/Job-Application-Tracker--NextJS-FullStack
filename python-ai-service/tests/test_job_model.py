"""JobInput accepts the current posting field names and the legacy bluedoor_* aliases."""

from app.models.job import JobInput

BASE = {
    "job_id": "job-1",
    "position": "Frontend Engineer",
    "company": "Northwind Labs",
    "location": "Remote",
    "status": "pending",
    "mode": "full-time",
}


def test_posting_field_names():
    job = JobInput(**BASE, posting_status="open", workplace_type="remote", salary_min=100, salary_max=200, salary_currency="USD")
    assert (job.posting_status, job.workplace_type, job.salary_min, job.salary_max, job.salary_currency) == (
        "open",
        "remote",
        100,
        200,
        "USD",
    )


def test_legacy_bluedoor_aliases():
    job = JobInput.model_validate(
        {**BASE, "bluedoor_status": "closed", "bluedoor_workplace_type": "hybrid", "bluedoor_salary_min": 90}
    )
    assert (job.posting_status, job.workplace_type, job.salary_min) == ("closed", "hybrid", 90)
