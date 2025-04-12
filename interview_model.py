import time
import ollama
import speech_recognition as sr
import pyttsx3
import threading
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["Kairos_Interview"]

engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

def recognize_speech():
    """Records speech until the user presses Enter again and returns the recognized text."""
    recognizer = sr.Recognizer()
    stop_recording = False
    
    def stop_listener():
        nonlocal stop_recording
        input()  
        stop_recording = True
    
    with sr.Microphone() as source:
        input("Press Enter to start recording...")  
        print("Recording... Press Enter again to stop.")
        recognizer.adjust_for_ambient_noise(source)

        threading.Thread(target=stop_listener, daemon=True).start()

        audio_data = []
        while not stop_recording:
            audio = recognizer.listen(source, phrase_time_limit=5)
            audio_data.append(audio)

        print("\nRecording stopped. Processing...")

        combined_audio = sr.AudioData(
            b''.join(a.frame_data for a in audio_data),
            audio_data[0].sample_rate,
            audio_data[0].sample_width
        )

        try:
            return recognizer.recognize_google(combined_audio)
        except sr.UnknownValueError:
            return "[Unrecognized Speech]"
        except sr.RequestError:
            return "[Speech Recognition Error]"

def generate_question(topic, mode):
    """Generates a new question based on the previous question, score, and skip status."""
    collection = db[topic.lower().replace(" ", "_")]
    latest_doc = collection.find_one({}, sort=[("_id", -1)])

    if latest_doc:
        last_question = latest_doc.get("question", "")
        last_score = latest_doc.get("score", None)
        was_skipped = latest_doc.get("skip_flag", False)

        if was_skipped:
            prompt = (f"The interview is on the skill '{topic}'. The previous question was skipped. "
                      f"Ask a question from a different topic area but still under the same skill. "
                      f"Ensure it's at {mode} difficulty.")
        elif last_score is not None:
            if last_score > 8:
                prompt = (f"The interview is on '{topic}'. The last question was: '{last_question}'. "
                          f"The score was {last_score}, so ask a deeper or more advanced question on the same topic at {mode} difficulty.")
            elif 5 < last_score <= 8:
                prompt = (f"The interview is on '{topic}'. The last question was: '{last_question}'. "
                          f"The score was {last_score}, so ask a question from a different topic within the same skill at {mode} difficulty.")
            else:
                prompt = (f"Continue the interview on '{topic}'. The last question was: '{last_question}'. "
                          f"Generate the next relevant question at {mode} difficulty.")
        else:
            prompt = (f"Continue the interview on '{topic}'. The last question was: '{last_question}'. "
                      f"Generate the next relevant question at {mode} difficulty.")
    else:
        prompt = f"The topic is {topic}. Ask a question at {mode} difficulty on the given topic."

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": (
            "Pretend as AI interviewer. Provide only the next question. "
            "Make sure not to explain anything other than the question, just ask the question. "
            "Use the prompt as context and do not repeat previous questions."
        )},
        {"role": "user", "content": prompt}
    ])

    return response["message"]["content"]

def evaluate_answer(question, answer):
    """Evaluates the user's response and assigns a score."""
    if not answer.strip():
        return None, "No answer provided."

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "Evaluate the given answer for the given question. Provide two outputs:\n"
                                      "1. A single integer score (0-10).\n"
                                      "2. A 20-word feedback covering expertise and improvements required.\n"
                                      "Format: 'Score: X\nFeedback: <your feedback>'"},
        {"role": "user", "content": f"Question: {question}\nAnswer: {answer}\nGive only the output in the specified format."}
    ])

    response_text = response["message"]["content"].strip()

    try:
        score_line, feedback_line = response_text.split("\n", 1)
        score = int(score_line.replace("Score: ", "").strip())
        feedback = feedback_line.replace("Feedback: ", "").strip()
    except (ValueError, IndexError):
        score, feedback = 0, "Invalid response format. Unable to extract feedback."

    return score, feedback

def interview_session(topic, mode):
    """Runs an interactive interview session with the selected difficulty mode."""
    collection = db[topic.lower().replace(" ", "_")]

    while True:
        question = generate_question(topic, mode)
        print("\nInterviewer:", question)
        print("Say <exit> or <quit> to end interview session. Say <skip> to skip a question.")
        speak(question)

        doc = {"question": question, "answer": None, "score": None, "feedback": None, "mode": mode}
        inserted_id = collection.insert_one(doc).inserted_id

        answer = recognize_speech()
        print("You said:", answer)

        if answer.lower() in ["exit", "quit"]:
            print("Interview ended.")
            break

        elif answer.lower() == "skip":
            print("Skipping question...")
            feedback = "Question skipped. Consider testing a different topic within the same skill."
            score = 0
            collection.update_one(
                {"_id": inserted_id},
                {"$set": {
                    "answer": "Skipped",
                    "score": score,
                    "feedback": feedback,
                    "skip_flag": True
                }}
            )
            continue

        score, feedback = evaluate_answer(question, answer)
        if score is not None:
            collection.update_one(
                {"_id": inserted_id},
                {"$set": {
                    "answer": answer,
                    "score": score,
                    "feedback": feedback,
                    "skip_flag": False  
                }}
            )

        time.sleep(1)

if __name__ == "__main__":
    print("Select difficulty mode:")
    print("1. Easy")
    print("2. Medium")
    print("3. Hard")
    print("4. Mixed Difficulty")

    mode_choice = input("Enter choice (1/2/3/4): ")
    difficulty_levels = {"1": "easy", "2": "medium", "3": "hard", "4": "mixed"}
    mode = difficulty_levels.get(mode_choice, "medium")

    skill = input("Enter the skill you want to be tested on: ")
    interview_session(skill, mode)
