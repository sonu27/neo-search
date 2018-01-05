.PHONY: import image deploy run push stop

VERSION ?= local
IMAGE_NAME ?= thedotsteam/search.next:${VERSION}

import:
	./import_scripts/run-all.sh

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
