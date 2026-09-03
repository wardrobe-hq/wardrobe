<div align="center">
    <p align="center"><img width=85% src="resources/img/showcase.png"></p>
    <h4>👚 Selfhosted clothing management web app for your personal wardrobe or commercial store!</h4>
    <div>
        <a href="#introduction">Introduction</a> •
        <a href="#installation">Installation</a> •
        <a href="#getting-started">Getting Started</a> •
        <a href="#other">Other</a>
    </div>
    <!-- <img src="./.github/img/demo.png"> -->
</div>

&nbsp;

<a id="introduction"></a>

# ✨ Introduction
Wardrobe is a selfhosted, *non-vibe-coded* clothing & outfit management web application.  

Do you also have a lot of clothes, still struggle to decide what to wear and even sometimes forget about some?  
Then this is for you! *...and me, cause this was the motivation behind building it*

Wardrobe features:
- **Add your Clothes**
  - with: Image, Title, Description, Labels
- **Create Outfits:** Combine your Clothes!
  - with: Clothes per body part, Title, Labels
  - Automatically generated preview image based on clothes added
- **Browse your Clothes & Outfits**
  - What do I want to wear today?
  - Search by text, sort by name/date or filter by a combination of labels
  - Upcoming: Get recommendations based on your local weather & outfit labels
- **Create Labels & Label Categories**
  - Keep it organized: Each label has a category
  - Keep it *re*organized: Reorder your labels by dragging to sort them by relevancy
  - Comes pre-configured with labels for type, season, year, color & body part to get you started

...and more to come!

&nbsp;

<a id="installation"></a>

# 🛠️ Installation
System Requirements: Next to none.

## Docker Compose (recommended):
```bash
# Inside this directory, run:
docker compose up
```

If you're using Portainer, create a new stack and paste the contents of the [docker-compose.yml](./docker-compose.yml) instead.

<br>

<details>
  <summary><strong>Method 2: Local Install</strong> (Click to unfold)</summary>

  Make sure you have git, node & npm installed on your system.

  ```bash
  # Clone the git repository:
  git clone https://github.com/wardrobe-hq/wardrobe
  cd wardrobe

  # Install dependencies:
  npm ci --omit=dev

  # Build the project:
  npm run build
  cp -r ./data/defaults/* ./data

  # Start the service:
  PORT=<host_port> npm run start

  # Replace <host_port> with the port you want to access wardrobe at.
  # If you omit 'PORT=', port 3000 will be used.

  # To use the image background removal feature, you must start rembg as well.
  # Either by using docker:
  RMBG_DEBUG_PORT=7000 docker compose up -d rembg
  # ...or by following the official guide: https://github.com/danielgatis/rembg#usage-as-a-cli
  rembg s --no-ui
  ```

</details>

&nbsp;

> [!IMPORTANT]  
> No matter which method you chose, make sure to protect the service!  
> Wardrobe does not provide any authentication itself and I do not guarantee any security.  
> Either use a 3rdParty auth service, enable password protection in your reverse proxy, put it behind a VPN or don't expose it to the outside at all.

&nbsp;

## Configuration
Wardrobe optionally displays and uses your current weather conditions to make outfit recommendations.  
Weather data is taken from [openweathermap.org](https://openweathermap.org/).  
Please create a free account and [generate an API key](https://home.openweathermap.org/api_keys). You may set it in a moment on Wardrobe's settings page.

&nbsp;

<a id="getting-started"></a>

# 🚀 Getting Started
After starting the service, access wardrobe in your browser using the IP of your host and the port you specified above.  
Assuming you started the project on your current device using the default port 3000, open: `http://localhost:3000`

You will be greeted by an empty clothes browse page!

First, quickly check out the 'Settings' page, where you can configure your language, location and weather API key.  
After saving, head back to the 'Browse' page and let us start exploring:

<br>

**Clothes:**  
Start by adding a few of your clothes by clicking the "+ Add Clothing button".  
- Take and upload a picture of your piece of clothing hanging behind or lying on a neutral background
- Give your piece of clothing a fitting name
- Select a few fitting labels from the pre-configured list 
  - Make sure to select a body part label to be able to find it in the outfit editor!
- Save!

<br>

**Outfits:**  
You can now create an outfit using the clothes you've added.  
Switch to the "Outfits" menu using the nav bar on the left side and click "+ Add Outfit".
- Select a fitting piece of clothing for each body part from the clothing picker by clicking on "+"
- Give your new outfit a fitting name at the top left
- Select a few fitting labels from the pre-configured popout-list at the top right by clicking on "v"
  - In order to later use Wardrobe's outfit recommendation popup in the bottom right of the outfits page, you must have a fitting "Season" label selected!  
  Check them out later on the labels page; for now choose one or multiple seasons that fit your outfit best.
- Save!

<br>

**Labels:**  
Lastly, check out the labels menu:  
This menu allows you to add categories, which hold the labels you've already seen, to categorize and filter your clothing collection.

Categories may be configured to have a speciality, which unlocks another setting field for each label.  
Besides the already discovered body part speciality, you can also configure a color and a date/temperature range to wear that piece of clothing/outfit using the Season speciality.  

This season speciality is used to make outfit recommendations on the outfits page based on your current weather and date.  
To open the outfit recommendation popup, press the lightbulb button in the bottom right of the outfits page.

&nbsp;


<a id="other"></a>

# 📝 Other
## Contribution
Every contribution is welcome!  
Please see [CONTRIBUTING.md](/CONTRIBUTING.md).

## License
This project is licensed under the Open Source Copyleft AGPL-3.0 license.  
Please see [LICENSE](/LICENSE).

## Icons
SVG Icons, including the favicon, were taken from [Phosphor Icons](https://phosphoricons.com/).  
All their icons are licensed under the [MIT](https://raw.githubusercontent.com/phosphor-icons/homepage/master/LICENSE) license.

## 3D Model
Modified version of the Human Base Mesh from [Blender.org](https://www.blender.org/download/demo-files/).  
The original is licensed under the CC0 license.  
Please see [resources/3d-model/](/resources/3d-model/).

## AI usage
There is no, and never will be, any purely AI written and or unreviewed code in this project.  
I've sporadically used a free model to sketch context aware examples or speed up debugging, while doing the actual implementation myself.  
I'm inherently opposed to *vibe-coding* and want to build a maintainable application; any slop you may encounter (please open an issue!) is organically grown human slop.
