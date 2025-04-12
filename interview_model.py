import time
import ollama
from pymongo import MongoClient

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["Kairos_Interview"]

def generate_question(topic, mode):
    """Generates a new question based on the previous question stored in the database."""
    collection = db[topic.lower().replace(" ", "_")]
    latest_doc = collection.find_one({}, sort=[("_id", -1)])

    if latest_doc:
        last_question = latest_doc.get("question", "")
        prompt = (f"Continue the interview on '{topic}'. The last question was: '{last_question}'. "
                  f"Generate the next relevant question at {mode} difficulty.")
    else:
        prompt = f"The topic is {topic}. Ask a question at {mode} difficulty on the given topic."

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "Pretend as AI interviewer, provide only the next question. Do not add anything else."},
        {"role": "user", "content": prompt}
    ])

    return response["message"]["content"]

def evaluate_answer(question, answer):
    """Evaluates the user's response and assigns a score."""
    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "Evaluate the given answer for the given question. Provide two outputs:\n1. A single integer score (0-10).\n2. A 20-word feedback covering expertise and improvements required.\nFormat: 'Score: X\nFeedback: <your feedback>'"},
        {"role": "user", "content": f"Question: {question}\nAnswer: {answer}\nGive only the output in the specified format."}
    ])

    response_text = response["message"]["content"].strip()

    try:
        score_line, feedback_line = response_text.split("\n", 1)
        score = int(score_line.replace("Score: ", "").strip())
        feedback = feedback_line.replace("Feedback: ", "").strip()
    except (ValueError, IndexError):
        score, feedback = 0, "Invalid response format."

    return score, feedback

def interview_session(topic, mode):
    """Runs an interview session by generating and evaluating typed answers."""
    collection = db[topic.lower().replace(" ", "_")]

    while True:
        # Generate the next question
        question = generate_question(topic, mode)
        print("\nInterviewer:", question)

        # Insert the question into the database with placeholder for answer, score, and feedback
        doc = {"question": question, "answer": None, "score": None, "feedback": None, "mode": mode}
        inserted_id = collection.insert_one(doc).inserted_id

        # Wait for user input as their answer
        answer = input("Your answer: ")

        # Evaluate the answer and get a score and feedback
        score, feedback = evaluate_answer(question, answer)
        print(f"\nScore: {score}")
        print(f"Feedback: {feedback}\n")

        # Update the document with the user's answer, score, and feedback
        collection.update_one(
            {"_id": inserted_id},
            {"$set": {"answer": answer, "score": score, "feedback": feedback}}
        )

        # Wait a second before generating the next question
        time.sleep(1)

# === Entry Point ===
if __name__ == "__main__":
    # Ask the user for difficulty level
    print("Select difficulty mode:")
    print("1. Easy")
    print("2. Medium")
    print("3. Hard")
    print("4. Mixed Difficulty")

    mode_choice = input("Enter choice (1/2/3/4): ")
    difficulty_levels = {"1": "easy", "2": "medium", "3": "hard", "4": "mixed"}
    mode = difficulty_levels.get(mode_choice, "medium")

    # Ask the user for the skill to be tested on
    skill = input("Enter the skill you want to be tested on: ")

    # Start the interview session
    interview_session(skill, mode)
