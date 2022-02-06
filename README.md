# Chamomile-UofT
For UofT IX Hackathon

## Inspiration
Our inspiration came from the challenge proposed by Varient, a data aggregation platform that connects people with similar mutations together to help doctors and users.

## What it does
Our application works by allowing the user to upload an image file. The image is then sent to Google Cloud’s Document AI to extract the body of text, process it, and then matched it against the datastore of gene names for matches. 

## How we built it
While originally we had planned to feed this body of text to a Vertex AI ML for entity extraction, the trained model was not accurate due to a small dataset. Additionally, we attempted to build a  BigQuery ML model but struggled to format the data in the target column as required. Due to time constraints, we explored a different path and downloaded a list of gene symbols from HUGO Gene Nomenclature Committee’s website (https://www.genenames.org/). Using Node.js, and Multer, the image is processed and the text contents are efficiently matched against the datastore of gene names for matches. The app returns a JSON of the matching strings in order of highest frequency. This web app is then hosted on Google Cloud through App Engine at (https://uofthacksix-chamomile.ue.r.appspot.com/).

The UI while very simple is easy to use. The intent of this project was to create something that could easily be integrated into Varient’s architecture. Converting this project into an API to pass the JSON to the client would be very simple.

## How it meets the theme "restoration"
The overall goal of this application, which has not been implemented, was to create an application that could match mutated gene names from user-uploaded documents and connect them with resources, and others who share the common gene mutation. This would allow them to share strategies or items that have helped them deal with living with the gene mutation. This would allow these individuals to restore some normalcy in their lives again. 

## Challenges we ran into
Some of the challenges we faced:
- having a small data set to train the Vertex AI on
- time constraints on learning the new technologies, and the best way to effectively use it
- formatting the data in the target column when attempting to build a BigQuery ML model

## Accomplishments that we're proud of
The accomplishment that we are all proud of is the exposure we gained to all the new technologies we discovered and used this weekend. We had no idea how many AI tools Google offers. The exposure to new technologies and taking the risk to step out of our comfort zone and attempt to learn and use it this weekend in such a short amount of time is something we are all proud of.

## What we learned
This entire project was new to all of us. We have never used google cloud in this manner before, only for Firestore. We were unfamiliar with using Express and working with machine learning was something only one of us had a small amount of experience with. We learned a lot about Google Cloud and how to access the API through Python and Node.js.

## What's next for Chamomile 
The hack is not as complete as we would like since ideally there would be a machine learning aspect to confirm the guesses made by the substring matching and more data to improve the Vertex AI model. Improving on this would be a great step for this project. Also, add a more put-together UI to match the theme of this application. 
