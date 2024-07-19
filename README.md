# cake vj

Just wanted to build my own VJ software, and I like web tech - so used that. 

It's been so fun to add whatever features I want whatever UI.

# Based on VirtualMixerProject

The VirtualMixerProject is a virtual video mixer that can be built through a chainable interface and runs in WebGL. There is a website: [VirtualMixerProject.com](https://virtualmixproject.com/).

It was a great start but I soon realized I had an incompatible vision for the types of features I wanted. So by now I've hacked aruond in much oof the library. 

Write a simple node.js express app that creates a post endpoint where the incoming POST request contains a JSON snippet in the body. The JSON snippet should be written to a file on the server. If the file exists, overwrite it. The path to the file is provided in a querystring parameter named "file".
