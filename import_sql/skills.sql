select distinct s.id, s.title
from skills s
inner join user_skills us
on s.id = us.skillid
