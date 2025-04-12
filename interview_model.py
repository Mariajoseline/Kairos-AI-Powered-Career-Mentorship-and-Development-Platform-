import time
import ollama
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["Kairos_Interview"]

def generate_question(topic, mode):
    """Generates a new question based on the previous one, its answer, and evaluation feedback."""
    collection = db[topic.lower().replace(" ", "_")]
    latest_doc = collection.find_one({}, sort=[("_id", -1)])

    if latest_doc:
        last_question = latest_doc.get("question", "")
        last_score = latest_doc.get("score", None)
        last_answer = latest_doc.get("answer", "")
        last_feedback = latest_doc.get("feedback", "")

        if last_score is not None:
            if last_score > 8:
                prompt = (
                    f"The interview is on '{topic}'. The last question was: '{last_question}'. "
                    f"The user's answer was: '{last_answer}'. Score was {last_score}/10. "
                    f"Ask a deeper or more advanced follow-up question. Difficulty: {mode}."
                )
            elif 5 < last_score <= 8:
                prompt = (
                    f"The interview is on '{topic}'. The last question was: '{last_question}'. "
                    f"The user's answer was: '{last_answer}'. Score was {last_score}/10. "
                    f"Ask a question from a different subtopic within '{topic}' at {mode} difficulty."
                )
            else:
                prompt = (
                    f"Continue the interview on '{topic}'. The last question was: '{last_question}'. "
                    f"The answer was: '{last_answer}' with score {last_score}/10. Feedback: '{last_feedback}'. "
                    f"Ask a simpler or foundational question to test understanding. Difficulty: {mode}."
                )
        else:
            prompt = (
                f"Continue the interview on '{topic}'. The last question was: '{last_question}'. "
                f"Generate the next relevant question at {mode} difficulty."
            )
    else:
        prompt = f"The topic is '{topic}'. Start with a clear, standalone question at {mode} difficulty."

    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "You are an AI interviewer. Only generate the next question. Do not answer, explain, or add anything else."},
        {"role": "user", "content": prompt}
    ])

    return response["message"]["content"].strip()

def evaluate_answer(question, answer):
    """Evaluates the user's response and assigns a score with feedback."""
    response = ollama.chat(model="llava:7b", messages=[
        {"role": "system", "content": "Evaluate the given answer to the given question. Provide two outputs ONLY:\n"
                                     "1. A single integer score (0-10)\n"
                                     "2. Feedback with exactly 20 words on expertise and improvement.\n"
                                     "Format: 'Score: X\\nFeedback: <your feedback>'"},
        {"role": "user", "content": f"Question: {question}\nAnswer: {answer}\nGive only the output in the specified format."}
    ])

    response_text = response["message"]["content"].strip()

    try:
        score_line, feedback_line = response_text.split("\n", 1)
        score = int(score_line.replace("Score: ", "").strip())
        feedback = feedback_line.replace("Feedback: ", "").strip()
    except (ValueError, IndexError):
        score, feedback = 0, "Invalid format from evaluation. Please try again."

    return score, feedback

def interview_session(topic, mode):
    """Runs the interactive text-based interview session."""
    collection = db[topic.lower().replace(" ", "_")]

    while True:
        question = generate_question(topic, mode)
        print("\nInterviewer:", question)

        doc = {"question": question, "answer": None, "score": None, "feedback": None, "mode": mode}
        inserted_id = collection.insert_one(doc).inserted_id

        answer = input("Your answer: ")

        score, feedback = evaluate_answer(question, answer)
        print(f"\nScore: {score}/10")
        print(f"Feedback: {feedback}\n")

        collection.update_one(
            {"_id": inserted_id},
            {"$set": {"answer": answer, "score": score, "feedback": feedback}}
        )

        time.sleep(1)

if __name__ == "__main__":
    print("Select difficulty mode:")
    print("1. Easy")
    print("2. Medium")
    print("3. Hard")
    print("4. Mixed")

    mode_choice = input("Enter choice (1/2/3/4): ")
    difficulty_levels = {"1": "easy", "2": "medium", "3": "hard", "4": "mixed"}
    mode = difficulty_levels.get(mode_choice, "medium")

    skill = input("Enter the skill/topic you want to be interviewed on: ")

    interview_session(skill, mode)
