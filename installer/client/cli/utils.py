import os
from dotenv import load_dotenv
import subprocess

class Setup:
    def __init__(self):
        """        Initialize the object.

        Raises:
            OSError: If there is an error in creating the pattern directory.
        """

        self.config_directory = os.path.expanduser("~/.config/auxiliary")
        self.shconfigs = []
        home = os.path.expanduser("~")
        if os.path.exists(os.path.join(home, ".bashrc")):
            self.shconfigs.append(os.path.join(home, ".bashrc"))
        if os.path.exists(os.path.join(home, ".bash_profile")):
            self.shconfigs.append(os.path.join(home, ".bash_profile"))
        if os.path.exists(os.path.join(home, ".zshrc")):
            self.shconfigs.append(os.path.join(home, ".zshrc"))
        self.env_file = os.path.join(self.config_directory, ".env")
        load_dotenv(self.env_file)
        try:
            openaiapikey = os.environ["OPENAI_API_KEY"]
            self.openaiapi_key = openaiapikey
        except:
            pass

    def __ensure_env_file_created(self):
        """        Ensure that the environment file is created.

        Returns:
            None

        Raises:
            OSError: If the environment file cannot be created.
        """
        print("Creating empty environment file...")
        if not os.path.exists(self.env_file):
            with open(self.env_file, "w") as f:
                f.write("#No API key set\n")
        print("Environment file created.")

    def update_shconfigs(self):
        bootstrap_file = os.path.join(
            self.config_directory, "auxiliary-bootstrap.inc")
        sourceLine = f'if [ -f "{bootstrap_file}" ]; then . "{bootstrap_file}"; fi'
        for config in self.shconfigs:
            lines = None
            with open(config, 'r') as f:
                lines = f.readlines()
            with open(config, 'w') as f:
                for line in lines:
                    if sourceLine not in line:
                        f.write(line)
                f.write(sourceLine)

    def api_key(self, api_key):
        api_key = api_key.strip()
        if not os.path.exists(self.env_file) and api_key:
            with open(self.env_file, "w") as f:
                f.write(f"OPENAI_API_KEY={api_key}\n")
            print(f"OpenAI API key set to {api_key}")
        elif api_key:
            # erase the line OPENAI_API_KEY=key and write the new key
            with open(self.env_file, "r") as f:
                lines = f.readlines()
            with open(self.env_file, "w") as f:
                for line in lines:
                    if "OPENAI_API_KEY" not in line:
                        f.write(line)
                f.write(f"OPENAI_API_KEY={api_key}\n")

    def groq_key(self, groq_key):
        groq_key = groq_key.strip()
        if os.path.exists(self.env_file) and groq_key:
            with open(self.env_file, "r") as f:
                lines = f.readlines()
            with open(self.env_file, "w") as f:
                for line in lines:
                    if "GROQ_API_KEY" not in line:
                        f.write(line)
                f.write(f"GROQ_API_KEY={groq_key}\n")
        elif groq_key:
            with open(self.env_file, "w") as f:
                f.write(f"GROQ_API_KEY={groq_key}\n")

    def elevenlabs_key(self, elevenlabs_key):
        elevenlabs_key = elevenlabs_key.strip()
        if os.path.exists(self.env_file) and elevenlabs_key:
            with open(self.env_file, "r") as f:
                lines = f.readlines()
            with open(self.env_file, "w") as f:
                for line in lines:
                    if "ELEVENLABS_API_KEY" not in line:
                        f.write(line)
                f.write(f"ELEVENLABS_API_KEY={elevenlabs_key}\n")
        elif elevenlabs_key:
            with open(self.env_file, "w") as f:
                f.write(f"ELEVENLABS_API_KEY={elevenlabs_key}\n")

    def run(self):
        print("Welcome to Auxiliary. Let's get started.")
        apikey = input(
            "Please enter your OpenAI API key. If you do not have one or if you have already entered it, press enter.\n")
        self.api_key(apikey)

        groqkey = input(
            "Please enter your Groq API key. If you do not have one or if you have already entered it, press enter.\n")
        self.groq_key(groqkey)

        elevenlabskey = input(
            "Please enter your ElevenLabs API key. If you do not have one or if you have already entered it, press enter.\n")
        self.elevenlabs_key(elevenlabskey)
        
        self.update_shconfigs()
        self.__ensure_env_file_created()

def run_electron_app():
    os.chdir(os.path.dirname(os.path.realpath(__file__)))

    target_dir = '../gui'
    if not os.path.exists(target_dir):
        print(f"""The directory {
              target_dir} does not exist. Please check the path and try again.""")
        return
    
    try:
        subprocess.run(['npm', '--version'], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("NPM is not installed. Please install NPM and try again.")
        return
    
    os.chdir(target_dir)

    try:
        print("Running 'npm install'... This might take a few minutes.")
        subprocess.run(['npm', 'install'], check=True)
        print(
            "'npm install' completed successfully. Starting the Electron app with 'npm start'...")
        subprocess.run(['npm', 'start'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing NPM commands: {e}")
    
    