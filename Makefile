TAG ?= latest

NS ?= dhf0820
#NS ?= lovelygru
APP_NAME := uc_blaze
image_name := uc_blaze
stack_config_file := test.yml
stack_config_file80 := prod.yml
stack_name := gui

.PHONY: build run stop clean

build:
	@docker compose build --build-arg TAG=$(TAG) 
	@docker image tag $(image_name):$(TAG) $(NS)/$(image_name):$(TAG)
	@docker image push $(NS)/$(image_name):$(TAG)
	
push:
	@docker image tag $(image_name):$(TAG) $(NS)/$(image_name):$(TAG)
	@docker image push $(NS)/$(image_name):$(TAG)

deploy:
	@docker stack deploy --compose-file $(stack_config_file) $(stack_name)

deployProd:
	docker stack deploy -c prod.yml gui

stop:
	@docker stack rm $(stack_name)
	

clean:
	@docker system prune --volumes --force