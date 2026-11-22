# Iris Species Insight Garden

Build a web app called "Iris Species Classifier" that trains a machine learning model on the classic Iris dataset and lets users make predictions. DATA - Use the Iris dataset (150 samples; features: sepal length, sepal width, petal length, petal width in cm; target: setosa, versicolor, virginica). - Embed the dataset in the app as a local JSON/CSV file (no external API needed). Also allow the user to upload their own CSV with the same columns. MODEL - Train entirely in the browser using TensorFlow.js (or a TypeScript implementation of K-Nearest Neighbors / logistic regression if simpler). - Standardize the features, then split the data 80% train / 20% test with a fixed random seed. - Let the user choose the model (KNN or a small neural network) and key settings (e.g. k, epochs, learning rate), then click "Train Model". PAGES / SECTIONS 1. Data Explorer: table of the data, summary statistics, class counts, and a scatter plot with selectable x and y features coloured by species. 2. Train & Evaluate: show training progress (loss/accuracy chart), then test accuracy, a confusion matrix, and precision/recall/F1 per class. 3. Predict: sliders or inputs for the four measurements, with a "Predict" button that shows the predicted species and the probability for each class as a bar chart. 4. About: a short explanation of the dataset, the model and its limitations. DESIGN - Clean, modern, responsive UI with Tailwind and shadcn/ui, a light/dark mode toggle, and Recharts for charts. - Use consistent colours for the three species across all charts. QUALITY - Add loading states, input validation, and clear error messages. - Keep the code modular (separate files for data loading, model training and UI components) and add brief comments.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://iris-species-insight-garden.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bae9fd6f-b191-4408-9085-ca9ce34bb4fe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
