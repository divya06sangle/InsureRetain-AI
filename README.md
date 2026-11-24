# InsureRetain-AI

## 📂 Frontend Project Structure

```text
frontend/
├── src/
│   ├── services/
│   │   ├── gemini.js        # Gemini API integration and function-calling definitions
│   │   ├── mlEngine.js      # Client-side Random Forest inference and SHAP-based explanations
│   │   └── playbooks.js     # Enterprise retention rules and intervention playbooks
│   │
│   ├── data/
│   │   └── scenarios.js     # Predefined customer demo scenarios and policyholder profiles
│   │
│   ├── App.jsx              # Main dashboard layout and application view controller
│   ├── main.jsx             # React application entry point
│   └── index.css            # Tailwind CSS directives and custom theme styles
│
├── .env.example             # Example environment variables
├── index.html               # Application HTML entry point
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite development and build configuration
└── README.md                # Project documentation
```

## Regulatory & Compliance Considerations

InsureRetain AI is designed with explainability, fairness, and controlled decision-making in mind. Its architecture incorporates principles relevant to insurance regulatory and compliance environments.

### 1. Explainable AI & Model Transparency
- **SHAP-Based Explainability:** Provides feature-level explanations to help understand the factors influencing customer lapse predictions.
- **Auditable Predictions:** Makes model outputs more interpretable by presenting the contribution of individual policyholder and policy-related features.
- **Model Transparency:** Supports informed review of predictions rather than relying exclusively on opaque risk scores.

### 2. Fairness & Responsible Decision-Making
- **Behavior-Based Risk Assessment:** Focuses on relevant policyholder and policy characteristics, such as policy tenure, billing mode, and coverage details.
- **Bias Awareness:** Encourages the evaluation of model performance across relevant customer segments.
- **Human Oversight:** Supports informed retention decisions while keeping final business decisions under appropriate human supervision.

### 3. Grounded AI Recommendations
- **Controlled AI Actions:** Uses predefined business rules and tool-calling mechanisms to constrain AI-generated recommendations.
- **Enterprise Retention Playbooks:** Applies structured retention rules, including RET-103 and RET-104, to guide intervention strategies.
- **Consistent Recommendations:** Aligns suggested retention actions with predefined business logic rather than relying entirely on unrestricted LLM responses.

### 4. Regulatory Alignment

The project incorporates design principles relevant to:

- **NAIC:** Explainability, governance, and responsible AI practices in insurance.
- **IRDAI:** Transparency, policyholder protection, and responsible technology adoption in the Indian insurance sector.
- **Solvency II:** Governance, risk management, and model transparency principles in the European insurance framework.

*Note: These are architectural design considerations, not a certification of regulatory compliance. Actual compliance requires appropriate legal, actuarial, security, and governance assessments.*

## Support the Project

If you find **InsureRetain AI** useful for exploring machine learning, explainable AI, agentic workflows, or insurance technology, consider giving the repository a on GitHub.

Your support is appreciated!
