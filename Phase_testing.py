import os
import pytesseract
from PIL import Image
import ollama
import pyttsx3
import pymongo
from datetime import datetime

# MongoDB setup
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["interview_system"]
collection = db["resume_based_interviews"]

# Text-to-speech setup
engine = pyttsx3.init()
engine.setProperty('rate', 170)

def speak(text):
    print("AI:", text)
    engine.say(text)
    engine.runAndWait()

# Extract text from resume image using pytesseract
def extract_text_from_image(image_path):
    return pytesseract.image_to_string(Image.open(image_path))

# Structure extracted resume text using LLaVA
def structure_resume_with_llava(resume_text):
    response = ollama.chat(model="llava:7b", messages=[ 
        {"role": "system", "content": "You are a helpful assistant who extracts structured information from resumes."},
        {"role": "user", "content": f"Extract structured information from this resume text in a detailed format (like Name, Skills, Projects, Education, Certifications, Achievements, etc.):\n\n{resume_text}"}
    ])
    
    structured_resume = response["message"]["content"]
    
    # Print the structured resume content
    print("\nExtracted Resume Content:")
    print("---------------------------")
    print(structured_resume)
    
    return structured_resume

# Function to simulate speech recognition and handle user input
def transcribe_speech():
    # This is a placeholder for the actual implementation
    # In a real application, you would use a library like speech_recognition to get user input
    return input("Your answer: ").strip()

# Generate the next interview question based on resume and previous answers
def generate_resume_based_question(resume_text, previous_qas, difficulty="medium"):
    context = "\n".join([f"Q: {q}\nA: {a}" for q, a in previous_qas.items()])
    prompt = f"""Based on the resume below, ask a new interview question. make sure that you dont generate anything else other than the question, no explanation of anything must be given
Resume: {resume_text}
Previous Q&A:\n{context}
Difficulty: {difficulty}
Ask the next best question for this interview.
Just return the question only."""
    response = ollama.chat(model="llava:7b", messages=[ 
        {"role": "system", "content": "You're an expert technical interviewer."},
        {"role": "user", "content": prompt}
    ])
    return response["message"]["content"].strip()

# Evaluate the answer and store score in MongoDB
def evaluate_answer(question, answer):
    prompt = f"Evaluate the following interview question and answer. Rate it out of 10 and provide a brief explanation.\n\nQuestion: {question}\nAnswer: {answer}\n\nReturn result as JSON like: {{'score': 7, 'explanation': '...'}}"
    response = ollama.chat(model="llava:7b", messages=[ 
        {"role": "system", "content": "You're an expert interviewer evaluating responses."},
        {"role": "user", "content": prompt}
    ])
    result = response["message"]["content"]
    try:
        return eval(result.strip())
    except:
        return {'score': 0, 'explanation': "Could not evaluate"}

# Function to summarize the scoring based on resume content
def summarize_scores_based_on_resume(qas, structured_resume):
    prompt = f"""
    Summarize the scores for each skill/experience area mentioned in the resume below.
    Group the scores according to categories such as skills, projects, achievements, etc.
    Provide the summary in the following format:

    {{
        "scores_phase1": {{
            "Skill1": score,
            "Skill2": score,
            ...
        }},
        "overall_feedback": "Great job!" or "Needs improvement."
    }}
    Resume: {structured_resume}
    Q&A: {qas}
    """
    response = ollama.chat(model="llava:7b", messages=[ 
        {"role": "system", "content": "You're a resume evaluator summarizing scores."},
        {"role": "user", "content": prompt}
    ])
    return response["message"]["content"]

# Main function to conduct the resume-based interview
def resume_based_interview(image_path, difficulty="medium"):
    # Extract raw text from the resume image
    resume_text = extract_text_from_image(image_path)
    print(f"Extracted Raw Text from Resume:\n{resume_text}")
    
    # Use LLaVA to structure the extracted resume text
    structured_text = structure_resume_with_llava(resume_text)
    
    speak("Welcome to your resume-based interview. Let's begin!")
    
    # Initialize variables for the interview
    qas = {}  # question and answers storage
    start_time = datetime.now()

    while True:
        # Generate the next interview question based on resume content and previous answers
        question = generate_resume_based_question(structured_text, qas, difficulty)
        speak(question)
        
        # Get the user's answer (simulate speech recognition here)
        user_answer = transcribe_speech().strip()
        
        if user_answer.lower() in ["exit", "quit", "stop"]:
            # Exit the interview, summarize the results
            speak("Interview ended.")
            summary = summarize_scores_based_on_resume(qas, structured_text)
            speak("Summary of your performance:")
            speak(summary)
            break
        elif user_answer.lower() == "skip":
            speak("Question skipped.")
            continue
        elif not user_answer:
            continue

        # Store the question and answer in the dictionary
        qas[question] = user_answer
        
        # Evaluate the answer (store in MongoDB)
        eval_result = evaluate_answer(question, user_answer)
        score = eval_result['score']
        explanation = eval_result['explanation']
        
        # Store each Q&A with feedback and score in the MongoDB database
        result_data = {
            "resume_path": image_path,
            "structured_resume": structured_text,
            "question": question,
            "answer": user_answer,
            "score": score,
            "feedback": explanation,
            "timestamp": datetime.now()
        }
        collection.insert_one(result_data)

        # Adjust the difficulty based on the score
        if score >= 8:
            difficulty = "hard"
        elif 5 <= score < 8:
            difficulty = "medium"
        else:
            difficulty = "easy"

    # After the interview, store a final summary (end time, average score, etc.)
    final_scores = {'average_score': sum([eval_result['score'] for eval_result in qas.values()]) / len(qas) if qas else 0}
    end_time = datetime.now()

    result_data = {
        "resume_path": image_path,
        "structured_resume": structured_text,
        "qa": qas,
        "final_scores": final_scores,
        "start_time": start_time,
        "end_time": end_time,
        "summary": {
            "average_score": final_scores['average_score'],
            "questions_attempted": len(qas),
            "overall_feedback": "Great job!" if final_scores['average_score'] >= 7 else "Needs improvement."
        }
    }

    collection.insert_one(result_data)
    speak("Thank you for attending the interview. Results have been stored.")

# Main execution entry point
if __name__ == "__main__":
    image_path = input("Enter the path to the resume image: ").strip()
    if os.path.exists(image_path):
        resume_based_interview(image_path, difficulty="medium")
    else:
        print("❌ File not found. Please check the path and try again.")
