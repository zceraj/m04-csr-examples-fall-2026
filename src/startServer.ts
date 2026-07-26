// startServer.ts

// Run this script to launch the server.
/* eslint no-console: "off" */

import { app } from "./server.ts";

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
