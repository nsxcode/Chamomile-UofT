from cgitb import text
import json

from google.cloud import storage
from google.cloud import documentai_v1 as documentai
import re
import os
import csv

def process_document(project_id: str, location: str,
                     processor_id: str, file_path: str,
                     mime_type: str) -> documentai.Document:
    """
    Processes a document using the Document AI API.
    """

    # Instantiates a client
    documentai_client = documentai.DocumentProcessorServiceClient()

    # The full resource name of the processor, e.g.:
    # projects/project-id/locations/location/processor/processor-id
    # You must create new processors in the Cloud Console first
    resource_name = documentai_client.processor_path(
        project_id, location, processor_id)

    # Read the file into memory
    with open(file_path, "rb") as image:
        image_content = image.read()

        print(image_content)

        # Load Binary Data into Document AI RawDocument Object
        raw_document = documentai.RawDocument(
            content=image_content, mime_type=mime_type)

        # Configure the process request
        request = documentai.ProcessRequest(
            name=resource_name, raw_document=raw_document)

        # Use the Document AI client to process the sample form
        result = documentai_client.process_document(request=request)

        return result.document

def save_as_txt(body, name, folder_path):
    save_path = os.path.join(".\\VarientText\\", name+".txt")
    text_file = open(save_path, "w", encoding="utf-8")
    text_file.write(body)
    text_file.close()

def main():

    folder_path = "C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\VarientTextGood"

    geneTxt = "C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\chamomile-2\\Chamomile-UofT\\geneNames.txt"

    project_id = 'uofthacksix-chamomile'
    location = 'us'  # Format is 'us' or 'eu'
    processor_id = '55e7c48bc5f6701b'

    preJson = []
    fullJson = ''

    for filename in os.listdir(folder_path):

        file_path = folder_path + "\\" + filename

        with open(file_path, 'r', encoding="utf-8") as file :
            filedata = file.read()
            file.close()

        filedata = filedata.replace("\v", " ")

        textSet = set(re.sub("[^\w'-]", " ",  filedata).split())
        matches = {}

        with open(geneTxt, "r") as gfile:
            genes = gfile.read().splitlines()
            gfile.close()

        for gene in genes:
            if gene in textSet:
                if matches.__contains__(gene):
                    matches[gene] = matches[gene] + 1
                else:
                    matches[gene] = 1

        #build json
        guessArray = []
        for match in matches:
            guessArray.append({"match": match, "count": matches[match]})

        if filename.find('#') != -1:
            labels = re.findall(r"^[^#]+", filename)[0].split("_")
        else:
            labels = re.findall(r"^[^.]+", filename)[0].split("_")       


        preJson.append({"body": filedata, "guesses": guessArray, "target": labels})

    for obj in preJson:
        fullJson = fullJson + "\n" + json.dumps(obj)


    text_file = open("./bigqueryjson.txt", "w", encoding="utf-8")
    text_file.write(fullJson)
    text_file.close()

main()
