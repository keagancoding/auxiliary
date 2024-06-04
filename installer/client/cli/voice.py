import os
import sys
from elevenlabs import VoiceSettings
import os
import sys
from elevenlabs.client import ElevenLabs
from elevenlabs import stream, VoiceSettings, Voice
from dotenv import load_dotenv

env_file = os.path.expanduser("~/.config/auxiliary/.env")
load_dotenv(env_file)

client = None
try: 
    client = ElevenLabs(
        api_key=os.environ["ELEVENLABS_API_KEY"],
    )
except:
    print("Please set up your ElevenLabs API key.")
    sys.exit()

def speak(text):

    audio_stream = client.generate(
        text=text,
        stream=True,
        voice=Voice(
            voice_id="N6IriEYanZlgVKSpSkPC",
            settings=VoiceSettings(
                stability=0.71,
                similarity_boost=0.5,
                style=0.0,
                use_speaker_boost=True
            )
        )
    )

    stream(audio_stream)
    


