import time
import ollama
import speech_recognition as sr
import pyttsx3
import threading
from pymongo import MongoClient
import os
import pytesseract
from PIL import Image
import re

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client["Kairos_Interview"]

# TTS Initialization
engine = pyttsx3.init()
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Sanitize MongoDB collection name
def sanitize_collection_name(name):
    name = name.lower().replace(" ", "_")
    name = re.sub(r'[^\w]', '_', name)
    return name[:50]

# Speech Recognition Function
def recognize_speech():
    recognizer = sr.Recognizer()
    stop_flag = False

    def stopper():
        nonlocal stop_flag
        input()
        stop_flag = True

    with sr.Microphone() as source:
        input("Press Enter to start recording... ")
        print("Recording... Press Enter to stop.")
        recognizer.adjust_for_ambient_noise(source)
        threading.Thread(target=stopper, daemon=True).start()

        audio_data = []
        while not stop_flag:
            try:
                audio = recognizer.listen(source, phrase_time_limit=5)
                audio_data.append(audio)
            except Exception:
                break

        if not audio_data:
            return "[No speech detected]"

        print("Recording complete. Processing...")

        combined = sr.AudioData(
            b''.join(a.frame_data for a in audio_data),
            audio_data[0].sample_rate,
            audio_data[0].sample_width
        )

        try:
            return recognizer.recognize_google(combined)
        except sr.UnknownValueError:
            return "[Unrecognized Speech]"
        except sr.RequestError:
            return "[Recognition Error]"

# LLaVA Question Generator
def generate_question(topic, prev_q=None, prev_score=None, was_skipped=False, mode="medium"):
    collection = db[sanitize_collection_name(topic)]
    latest = collection.find_one({}, sort=[("_id", -1)])

    if latest:
        last_q = latest.get("question", "")
        last_score = latest.get("score", None)
        was_skipped = latest.get("skip_flag", False)

        if was_skipped:
            prompt = f"The interview is on '{topic}'. The previous question was skipped. Ask a new question at {mode} difficulty.Remember to not explain anything, just ask the question nothing else at all"
        elif last_score is not None:
            if last_score > 8:
                prompt = f"The topic is '{topic}'. The last question was '{last_q}' and score was {last_score}. Ask a deeper follow-up. Remember to not explain anything, just ask the question nothing else at all"
            elif 5 < last_score <= 8:
                prompt = f"The topic is '{topic}'. The last question was '{last_q}' and score was {last_score}. Ask a related question.Remember to not explain anything, just ask the question nothing else at all"
            else:
                prompt = f"The topic is '{topic}'. Continue with a relevant question.Remember to not explain anything, just ask the question nothing else at all"
        else:
            prompt = f"Continue the interview on '{topic}' with a new question at {mode} difficulty.Remember to not explain anything, just ask the question nothing else at all"
    else:
        prompt = f"Start the interview on '{topic}' with a question at {mode} difficulty.Remember to not explain anything, just ask the question nothing else at all"

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "You're an AI interviewer. Ask one interview question only."},
        {"role": "user", "content": prompt}
    ])
    return response["message"]["content"]

# Evaluate Answer
def evaluate_answer(question, answer):
    if not answer.strip():
        return 0, "No answer provided."

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "Evaluate the answer and return:\nScore: <0-10>\nFeedback: <20-word feedback>"},
        {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"}
    ])

    content = response["message"]["content"].strip()
    try:
        score_match = re.search(r"Score:\s*(\d+)", content)
        feedback_match = re.search(r"Feedback:\s*(.*)", content, re.DOTALL)

        score = int(score_match.group(1)) if score_match else 0
        feedback = feedback_match.group(1).strip() if feedback_match else "No feedback found."
        return score, feedback
    except Exception as e:
        return 0, f"Evaluation error: {e}"


# OCR Resume Text
def extract_text_from_image(path):
    if not os.path.exists(path):
        print("❌ Image not found.")
        return ""
    try:
        return pytesseract.image_to_string(Image.open(path)).strip()
    except Exception as e:
        print("❌ OCR failed:", e)
        return ""

# Structure Resume with LLaVA
def structure_resume_with_llava(raw):
    prompt = f"""
Organize this resume text into:
- Interests, Skills, Tools, Projects, Certifications, Experience, Co-curricular, Extra-curricular, Achievements

=== Resume Text ===
{raw}
"""
    try:
        response = ollama.chat(model="llava:13b", messages=[
            {"role": "system", "content": "You're an expert resume analyzer."},
            {"role": "user", "content": prompt}
        ])
        return response["message"]["content"]
    except Exception as e:
        print("❌ Structuring failed:", e)
        return ""

# Resume-based Interview Session
def resume_based_interview(structured_text):
    topic = "Resume Based Interview"
    collection = db[sanitize_collection_name(topic)]
    context = structured_text.replace("\n", " ")
    prev_q, prev_score, was_skipped = None, None, False

    while True:
        if was_skipped:
            prompt = f"The resume is: {context}. The last question was skipped. Ask a new question on a different subtopic."
        elif prev_score is not None:
            if prev_score > 8:
                prompt = f"The resume is: {context}. The last question was '{prev_q}'. Score: {prev_score}. Ask a deeper follow-up."
            elif 5 < prev_score <= 8:
                prompt = f"The resume is: {context}. The last question was '{prev_q}'. Score: {prev_score}. Ask a related follow-up."
            else:
                prompt = f"The resume is: {context}. Continue with a new question."
        else:
            prompt = f"Based on the resume: {context}. Start with a question."

        response = ollama.chat(model="llava:7b", messages=[
            {"role": "system", "content": "You're an AI interviewer. Ask one interview question only."},
            {"role": "user", "content": prompt}
        ])
        question = response["message"]["content"]
        print("\n🤖 Interviewer:", question)
        speak(question)

        doc = {"question": question, "answer": None, "score": None, "feedback": None}
        inserted = collection.insert_one(doc).inserted_id

        print("🗣️ Say 'skip' or 'exit'")
        answer = recognize_speech()
        print("🧑 You said:", answer)

        if answer.lower() in ["exit", "quit"]:
            print("👋 Ending interview.")
            break
        elif answer.lower() == "skip":
            collection.update_one({"_id": inserted}, {
                "$set": {"answer": "Skipped", "score": 0, "feedback": "Skipped by user", "skip_flag": True}
            })
            prev_q, prev_score, was_skipped = question, 0, True
            continue

        score, feedback = evaluate_answer(question, answer)
        collection.update_one({"_id": inserted}, {
            "$set": {"answer": answer, "score": score, "feedback": feedback, "skip_flag": False}
        })
        prev_q, prev_score, was_skipped = question, score, False
        time.sleep(1)

# General Interview Session
def interview_session(topic, mode):
    topic = sanitize_collection_name(topic)
    collection = db[topic]
    prev_q, prev_score, was_skipped = None, None, False

    while True:
        question = generate_question(topic, prev_q, prev_score, was_skipped, mode)
        print("\n🤖 Interviewer:", question)
        speak(question)

        print("🗣️ Say 'skip' or 'exit'")
        doc = {"question": question, "answer": None, "score": None, "feedback": None, "mode": mode}
        inserted = collection.insert_one(doc).inserted_id

        answer = recognize_speech()
        print("🧑 You said:", answer)

        if answer.lower() in ["exit", "quit"]:
            print("👋 Interview ended.")
            break
        elif answer.lower() == "skip":
            collection.update_one({"_id": inserted}, {
                "$set": {"answer": "Skipped", "score": 0, "feedback": "Skipped by user", "skip_flag": True}
            })
            prev_q, prev_score, was_skipped = question, 0, True
            continue

        score, feedback = evaluate_answer(question, answer)
        collection.update_one({"_id": inserted}, {
            "$set": {"answer": answer, "score": score, "feedback": feedback, "skip_flag": False}
        })
        prev_q, prev_score, was_skipped = question, score, False
        time.sleep(1)

# === MAIN MENU ===
if __name__ == "__main__":
    print("Select interview mode:")
    print("1. Easy\n2. Medium\n3. Hard\n4. Resume Based Interview")
    choice = input("Enter choice number: ")

    if choice == "4":
        image_path = input("Enter resume image path: ")
        raw_text = extract_text_from_image(image_path)
        if raw_text:
            structured = structure_resume_with_llava(raw_text)
            print("\n📄 Structured Resume:\n", structured)

            db["resume_data"].insert_one({
                "raw_text": raw_text,
                "structured_text": structured,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            resume_based_interview(structured)
    else:
        try:
            mode = ["easy", "medium", "hard"][int(choice)-1]
        except:
            print("❌ Invalid choice.")
            exit()
        topic = input("Enter topic for interview: ")
        interview_session(topic,mode)
