  const blob = new Blob([JSON.stringify(generateDoctors())], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
      <a
        href={url}
        download="doctors.json"
        className="text-center mb-4 bg-accent-dark p-2 
      rounded-md text-white font-black w-fit mx-auto px-10"
      >
        Download doctors list!
      </a>


""" 
The above code shows how one can download a json file using a simple html anchor tag
using attributes download, passing it the name of the file as a string
and the url (the url created from the blob of the json file)
"""

"""