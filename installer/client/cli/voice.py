import os
import sys
from elevenlabs import VoiceSettings
import os
import sys
from elevenlabs.client import ElevenLabs
from elevenlabs import stream, VoiceSettings, Voice

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    print("Please set the ELEVENLABS_API_KEY environment variable.")
    sys.exit()

client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

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
    


