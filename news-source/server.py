import time
import configparser
import subprocess

# Load server configuration
config = configparser.ConfigParser()
config.read('server.config')
sleep_time_minutes = config.getint('DEFAULT', 'sleep_time_minutes')

while True:
    # Call the scrapper script
    subprocess.run(['python', 'scrapper.py'])
    # Sleep for the specified number of minutes
    time.sleep(sleep_time_minutes * 60)