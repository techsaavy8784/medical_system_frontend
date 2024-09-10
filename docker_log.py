import docker
import logging
import datetime


client = docker.client.from_env()

# Set up logging
logging.basicConfig(filename='resources_' + datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S') + '.log', level=logging.INFO)

# List Docker sources and log the output
images = client.images.list()
containers = client.containers.list()
services = client.services.list()
networks = client.networks.list()
volumes = client.volumes.list()


for image in images:
    logging.info(image)

for container in containers:
    logging.info(container)

for service in services:
    logging.info(service)

for network in networks:
    logging.info(network)

for volume in volumes:
    logging.info(volume)
