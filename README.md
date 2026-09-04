<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# കഷണ്ടി meter 🎯


## Basic Details
### Team Name: Overkill


### Team Members
-Devika G Nair  - Govt. Model Engineering College, Thrikkakkara

### Project Description
**Bald or Not** is a fun AI-powered web application that predicts how many years a person has left before they might go bald, based on an uploaded photo. Built purely for entertainment, it uses computer vision to turn an unnecessary question into an unnecessarily serious prediction. 😭


### The Problem (that doesn't exist)
Have you ever looked at a photo and thought:

“But exactly how many years do I have left before I go bald?”

Absolutely nobody asked for this information, but we decided to solve it anyway. Humans already have enough things to worry about, so we built an AI that gives you one more completely unnecessary prediction.

### The Solution (that nobody asked for)
Upload a photo, and our highly questionable AI analyzes your face and hair to predict how many years you have until baldness potentially strikes.

Is it medically accurate? No.
Is it scientifically reliable? Also no.
Is it unnecessarily entertaining? Absolutely.

The project uses computer vision to detect a face from the uploaded image and then generates a completely fun, randomized baldness prediction. The result is accompanied by a dramatic message because apparently just showing a number wasn't chaotic enough.

## Technical Details
### Technologies/Components Used
For Software:
Languages used: Python, JavaScript, HTML, CSS
Framework used: Flask
Libraries used:
      OpenCV (cv2)
      NumPy
      MediaPipe
      Flask
Tools used:
      GitHub
      VS Code
      Python Virtual Environment


### Implementation
For Software:
# Installation
git clone https://github.com/devika038/useless_project_temp.git
cd useless_project_temp
python -m venv venv

# Run
python app.py

````markdown
### Project Documentation

#### For Software:

The project follows a simple client-server architecture:

```text
useless_project_temp/
│
├── static/
│   ├── style.css       # Styling and animations
│   └── script.js       # Frontend interactions
│
├── templates/
│   └── index.html      # Main user interface
│
├── app.py              # Flask backend and image processing
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
````

**Workflow:**

1. User uploads an image through the web interface.
2. The image is sent to the Flask backend.
3. OpenCV and MediaPipe process the uploaded image.
4. The system analyzes the detected facial features.
5. A fun baldness prediction is generated.
6. The prediction is displayed on the frontend.

```
```


# Screenshots (Add at least 3)
<img width="947" height="599" alt="Screenshot 2026-09-04 060134" src="https://github.com/user-attachments/assets/32a3c59e-6687-4374-ae59-fa3283c26379" />
The Malayalam Meter home screen invites users to upload 1–3 photos for a playful, fictional hairline analysis.

<img width="938" height="539" alt="Screenshot 2026-09-04 060216" src="https://github.com/user-attachments/assets/10e585a8-3de0-40cc-ae5b-dc516379d746" />
Users can drag and drop a front-facing photo or browse files, with guidance for clearer analysis.

<img width="550" height="395" alt="Screenshot 2026-09-04 060227" src="https://github.com/user-attachments/assets/55662a3b-2878-4869-a0c9-d21d9360073e" />
After selecting a photo, users can review it, remove it, clear all photos, or begin the hairline analysis.

<img width="550" height="395" alt="Screenshot 2026-09-04 060227" src="https://github.com/user-attachments/assets/139ef4d3-084d-4eac-9416-6c291600e3e7" />
A humorous loading state simulates the app’s fictional hairline analysis process.

<img width="947" height="419" alt="Screenshot 2026-09-04 060249" src="https://github.com/user-attachments/assets/62410a25-cb80-411d-9079-232cd4cfa37b" />
The results screen presents the “Chrome Dome” status, humorous commentary, density and recession scores, and a fictional confidence meter.

<img width="800" height="500" alt="kashandi-meter-result" src="https://github.com/user-attachments/assets/d6e5e7ff-8895-4d83-8788-9ea2e75e1960" />
Downloadable result card
A shareable Malayalam Meter result card summarizing the fictional “Chrome Dome” verdict, estimated baldness deadline, density score, and recession score.

# Diagrams
# Diagrams

```mermaid
flowchart TD
    A[User opens Malayalam Meter] --> B[Upload 1-3 photos]
    B --> C[POST /upload]
    C --> D{Validate file count, size, and format}

    D -->|Invalid| E[Show upload error]
    D -->|Valid| F[Store images in a temporary session folder]

    F --> G[Return session ID]
    G --> H[User selects Analyse My Hairline]
    H --> I[POST /analyze]

    I --> J[Analyse image patterns]
    J --> K[Calculate fictional density and recession scores]
    K --> L[Generate humorous hairline category and timeline]

    L --> M[Delete uploaded photos immediately]
    M --> N[Store result temporarily in memory]
    N --> O[Display result dashboard]
    O --> P[Download shareable result card]

    N --> Q[Automatically remove expired results after 30 minutes]
```
Workflow architecture: Users upload up to three photos, which are validated and analysed using visible image patterns. Malayalam Meter generates a fictional entertainment-only result, deletes the uploaded photos immediately after analysis, displays the result dashboard, and automatically removes temporary results after 30 minutes.


### Project Demo
# Video

(https://drive.google.com/file/d/1XnTEd_LnNWx38BELoA4GLftP036wFj3q/view?usp=sharing)
The video demonstrates the complete Malayalam Meter experience: selecting and uploading a photo, starting the fictional hairline analysis, viewing the animated analysis screen, and receiving a humorous result with a hairline category, estimated baldness timeline, density score, recession score, and downloadable result card. It also highlights that the project is made purely for entertainment and does not provide medical advice.


## Team Contributions
- Thaniya Haris - partner in crime

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



