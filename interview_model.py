import time
import ollama
from pymongo import MongoClient

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
    """Evaluates the user's response and assigns a score with improved fallback and debugging."""
    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": (
            "You are an AI interviewer. Score the answer from 0-10 and give a 20-word feedback.\n"
            "Return ONLY:\nScore: <number>\nFeedback: <20-word feedback>")},
        {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"}
    ])

    response_text = response["message"]["content"].strip()
    print("[DEBUG] Raw model response:\n", response_text)  

    try:
        lines = response_text.splitlines()
        score_line = next(line for line in lines if "Score:" in line)
        feedback_line = next(line for line in lines if "Feedback:" in line)

        score = int(score_line.replace("Score:", "").strip())
        feedback = feedback_line.replace("Feedback:", "").strip()
    except Exception as e:
        score = 0
        feedback = f"Invalid response format. Error: {e}"

    return score, feedback


def interview_session(topic, mode):
    """Runs an interview session by generating and evaluating typed answers, with support for skip and exit."""
    collection = db[topic.lower().replace(" ", "_")]

    while True:
        question = generate_question(topic, mode)
        print("\nInterviewer:", question)
        print("Type 'exit' or 'quit' to end the session. Type 'skip' to skip this question.")

        doc = {"question": question, "answer": None, "score": None, "feedback": None, "mode": mode}
        inserted_id = collection.insert_one(doc).inserted_id

        answer = input("Your answer: ").strip()

        if answer.lower() in ["exit", "quit"]:
            print("Interview session ended.")
            break

        elif answer.lower() == "skip":
            print("Skipping this question.")
            feedback = "Question skipped. Consider revisiting this topic later."
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
        print(f"\nScore: {score}")
        print(f"Feedback: {feedback}\n")

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
