select
  u.id as id,
  u.firstName as firstName,
  u.lastName as lastName,
  u.levelId as level,
  u.searchScore as searchScore,
  u.availableForFullTime as availableForFullTime,
  u.availableForFreelance as availableForFreelance,
  u.availableForInternships as availableForInternships,
  u.createdAt as createdAt,
  tb.text as tagline,
  a.filename as profileImage,
  l.name as locationName,
  l.latitude as locationLatitude,
  l.longitude as locationLongitude
from users u
left join text_blocks tb
on u.taglineId = tb.id
left join assets a
on u.profileImageId = a.id
left join locations l
on u.locationId = l.id
where u.deletedAt is null
