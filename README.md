# Reading Glasses

### Background
This hackathon-style solo project was built over the course of roughly 2 days, and gave me a chance to try something new and completely on my own. Because it was my first time attempting something solo, my concept was pitched to an instructor to verify its viability.

### Motivation
The overarching goal of this project was to help solve a personal problem: understanding what is in the food I buy. Oftentimes when I'm grocery shopping, I have no idea what some ingredients are on the labels, especially the ones that are just chemical names. I have to pull up a Google search and bushwhack my way through the scientific information to find the health effects I actually care about.

### Execution
The MVP of this project was to create a mobile app that can take a picture, extract text from the image, and allow the user to then perform an information query. To achieve this, I utilized React Native as the framework to build my app on, the Google Vision API for text extraction, and the E-Additive API for ingredient information. As it was my first time using any of these technologies, it took some effort to get off the ground, but to have something that could function within the amount of time I had was extremely gratifying.

### Demonstration
The following gif demonstrates the user experience:
- Access the app's Github or my LinkedIn from the home page
- Take a photo and wait for the Google Vision API to extract the text
- Verify that the ingredients have been successfully captured and parsed
- Tap "Let's Get Paranoid" to send the data to the E-Additive API
- View information for the additives found
- Take another photo if desired

![Reading Glasses Demo](demo.gif)

### Deployment
This app was deployed using Expo: https://expo.io/@chutim/reading-glasses
