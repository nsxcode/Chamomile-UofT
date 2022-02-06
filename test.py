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

    folder_paths = ['C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\TextTraining', 'C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\TextValidation', 'C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\TextTesting']

    # bucket_name = "varient_training_dataset"

    # storage_client = storage.Client()

    # # Note: Client.list_blobs requires at least package version 1.17.0.
    # blobs = storage_client.list_blobs(bucket_name)

    # for blob in blobs:
    #     file_name = blob.name
    #     ext = re.findall(r"[^.]+$", file_name)
    #     print(ext)

    #     if ext == 'png':
    #         mime_type = 'image/png'
    #     else:
    #         mime_type = 'image/jpeg'

    #     file_path = 

    project_id = 'uofthacksix-chamomile'
    location = 'us'  # Format is 'us' or 'eu'
    processor_id = '55e7c48bc5f6701b'

    for folder_path in folder_paths:
        for filename in os.listdir(folder_path):
            
            mime_type = " "
            
            if filename.endswith(".png"):
                mime_type = 'image/png'
            if filename.endswith(".jpg"):
                mime_type = 'image/jpeg'

            file_path = folder_path + "\\" + filename

            if mime_type != " ":
                document = process_document(project_id=project_id, location=location,
                                        processor_id=processor_id, file_path=file_path,
                                        mime_type=mime_type)

                save_as_txt(document.text.replace("\v", " "), re.findall(r"^[^.]+", filename)[0], folder_path)

            else:
                with open(file_path, 'r', encoding="utf-8") as file :
                    filedata = file.read()

                filedata = filedata.replace("\v", " ")

                # Write the file out again
                with open(file_path, 'w', encoding="utf-8") as file:
                    file.write(filedata)

    # with open('varient_training.csv', 'a', newline='', encoding='utf-8') as csvfile:
    #     filewriter = csv.writer(csvfile, delimiter=',', quoting=csv.QUOTE_NONE, quotechar='')

    #     for filename in os.listdir(folder_path):
    #         if filename.endswith(".png"):
    #             mime_type = 'image/png'
    #         else:
    #             mime_type = 'image/jpeg'

    #         file_path = folder_path + "\\" + filename

    #         document = process_document(project_id=project_id, location=location,
    #                                 processor_id=processor_id, file_path=file_path,
    #                                 mime_type=mime_type)

    #         #print("Document processing complete.")
    #         #print(f"Text: {document.text}")

    #         if filename.find('_') != -1:
    #             #select everything before the underscore
    #             label = re.findall(r"^[^_]+", filename)
    #         else:
    #             #select everything before the period
    #             label = re.findall(r"^[^.]+", filename)

    #         #print(repr(document.text))
    #         label = label[0]
    #         print(label)
    #         save_as_txt(document.text, re.findall(r"^[^.]+", filename)[0])
    #         body = '"'+document.text.replace("\n", " ").replace("\r", " ").replace("\"", " ").replace(",","")+'"'
    #         filewriter.writerow(['training',body,label])



main()
