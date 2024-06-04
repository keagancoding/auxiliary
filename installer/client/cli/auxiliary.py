from .utils import Setup
from .voice import speak
import sys
import argparse
import os

script_directory = os.path.dirname(os.path.realpath(__file__))

def main():
    parser = argparse.ArgumentParser(
        description="An open source AI personal assistant."
    )

    parser.add_argument("--setup", "-s", help="Set up your auxiliary assistant.", action="store_true")
    parser.add_argument("--gui", "-g", help="Enable auxiliary assistant GUI.")
    parser.add_argument("--voice", "-v", help="Enable wakeword and speach to text input, active listening")

    args = parser.parse_args()
    home_folder = os.path.expanduser("~")
    config = os.path.join(home_folder, ".config", "auxiliary")
    env_file = os.path.join(config, ".env")

    if not os.path.exists(config):
        os.makedirs(config)
    if args.setup:
        Setup().run()
        sys.exit()
    if not os.path.exists(env_file):
        print("Please run --setup to set up your API key.")
        sys.exit()
    if args.gui:
        pass
    if args.voice:
        # Start voice listening
        pass

    speak("Welcome to the Auxiliary Assistant, lets get started.")
    

