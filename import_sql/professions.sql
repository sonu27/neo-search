select
  distinct p.id as id,
  p.title as name
from professions p
inner join user_professions up
on p.id = up.professionId
inner join users u
on up.userId = u.id
where u.deletedAt is null
