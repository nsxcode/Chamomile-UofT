import os

def  main():
    data = ""
    path = "C:\\Users\\angie\\AppData\\Local\\Temp\\tmpjalzbvzy\\dataset.csv"
    with open(path) as file:
        data = file.read().replace("\\","/")

    with open("C:\\Users\\angie\\OneDrive\\Documents\\MyStuff\\uofthacksix\\dataset.csv", "w", encoding="utf-8") as newfile:
        newfile.write(data)

main()