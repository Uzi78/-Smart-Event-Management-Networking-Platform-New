def ensure_positive(value: int, field_name: str) -> int:
    if value < 0:
        raise ValueError(f"{field_name} must be positive")
    return value
