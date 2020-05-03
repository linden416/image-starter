import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { Request, Response } from 'express';
import { any } from 'bluebird';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req: Request, res: Response) => {
    console.log(`/filteredimage`);
    let { image_url } = req.query;
    if ( !image_url ){
      return res.status(400).send(`Image_URL is required`);
    }

    try {
        let files : string[] = [];  // arr of strings
        filterImageFromURL(image_url).then(function(filteredpath){
            console.log(`filtered path: ${filteredpath}`);
            files.push(filteredpath); // add to arr
            // return filtered path and 200 status code
            // identify function to be called upon the
            // completion of the response. This function
            // deletes the locally filtered file
            return res.status(200).sendFile(filteredpath, 
              () => {deleteLocalFiles([filteredpath]);} )
        }
        ).catch(function(val) {  //rejected! ERR
            console.log(`rejected: ${val}`);
            if (val.includes("Could not find")){
              console.log("+");
              res.status(404).send("File Not Found");
              console.log("8");
            }
            else if (val.includes("no such file or directory")){
              res.status(400).send("Invalid URL");
            }
            else{
              res.status(500).send(val); //Return internal server err and emsg
            }

          }
        )
    } catch (error) {
      return res.status(500).send("Internal server error");  
    }
 });
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();