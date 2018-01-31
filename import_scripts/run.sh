#!/bin/sh
node import_scripts/0-0-create-csvs.js
node import_scripts/0-1-delete-es-indices.js
node import_scripts/1-1-neo4j-create-users.js
node import_scripts/1-3-create_following_relationships.js
node import_scripts/2-1-neo4j-create-professions.js
node import_scripts/2-3-create-user-professions-relationships.js
node import_scripts/2-4-send-professions-to-es-from-neo.js
node import_scripts/3-1-neo4j-create-skills.js
node import_scripts/3-3-create-user-skills-relationships.js
node import_scripts/3-4-send-skills-to-es-from-neo.js
node import_scripts/9-9-send-users-to-es-from-neo.js
