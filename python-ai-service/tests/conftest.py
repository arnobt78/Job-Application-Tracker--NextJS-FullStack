"""Keep real local secrets (.env.local) out of the test process — tests set env explicitly."""

import app.env

app.env.load_local_env = lambda: None
