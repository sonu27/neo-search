select
  up.userId as userId,
  up.professionId as professionId
from user_professions up
inner join users u
on up.userId = u.id
where u.deletedAt is null
