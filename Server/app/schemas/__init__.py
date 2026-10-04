"""API schema package.

Import models from the module that owns the resource instead of re-exporting
everything here. Keeping this module empty prevents accidental import cycles.

Dependency direction:
    base/types/enums -> recurrence/review -> clinic -> schedule -> doctor
    user + doctor + schedule + clinic -> appointment -> patient
"""
