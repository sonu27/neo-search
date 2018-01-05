.PHONY: build image deploy run push stop

VERSION ?= local
IMAGE_NAME ?= thedotsteam/search.next:${VERSION}

build:
	node import_scripts/0-0-create-csvs.js
	node import_scripts/1-1-create-user-index.js
	node import_scripts/1-2-import-users.js
	node import_scripts/1-3-create_following_relationships.js
	node import_scripts/2-1-create-professions-index.js
	node import_scripts/2-2-import-professions.js
	node import_scripts/2-3-create-user-professions-relationships.js
	node import_scripts/2-4-send-professions-to-es-from-neo.js
	node import_scripts/3-1-create-skills-index.js
	node import_scripts/3-2-import-skills.js
	node import_scripts/3-3-create-user-skills-relationships.js
	node import_scripts/3-4-send-skills-to-es-from-neo.js
	node import_scripts/9-9-send-users-to-es-from-neo.js

image:
	$(info Creating image)
	docker build \
		-t ${IMAGE_NAME} \
		-f Dockerfile \
		.

deploy:
	docker push ${IMAGE_NAME}

push: image deploy

run: image
	@docker-compose up -d

stop:
	@docker-compose stop

