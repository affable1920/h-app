24-jan-26

Bookings in place
patient wants to book an appointment with a doc,
we take him to this endpoint "doctors/{doc_id}/schedule"

at that route, we show him the doctor's schedule, the days he's available and the place
we also show him the slots

on a slot book, the user ll be asked to enter their name and contact number (in case of a guets user) or we simply send his register id on the server if logged in (an existing user).

once the user confirms the booking, we create a booking record in the db with the following details:

- user_id (if an existing user) or the guest; name and contact for a guest user. - allowing these at first
- the id of the record itself
- the slot, clinic, and doctor id
- date and time of the appointment

when creating the booking transaction, we used with_for_update on the query so that only one query can use the record at one time.

now, we moved to adding a status enum field to the appointment's table

25-jan-26
implementing the online consultation between a dr and a patient

- problems faced initially
  no discrimination or differentiation between the two entities, we don't know if a logged in user is a dr or just a patient

- thought about adding a role field to each entity but this doesn't scale well for coming up future entities like clinic admin, clinic and more.
  so came to sqlalchemy inheritance which sounded right and intuitive. see sqlalchemy.txt (locally) for more info on it's implementation.
