# Contributing to the project

You would like to contribute to the project?  
Great! No matter if it's fixing a few typos or adding a whole feature - every contribution, as long as it is not vibe-coded, is welcome.  

You can see a list of all features that still need to be worked on, are in progress or are finished in the repo's [projects](https://github.com/wardrobe-hq/wardrobe/projects) section.  

&nbsp;

## Table Of Contents
- [Reporting an issue](#reporting-an-issue)
- [How to fork and open pull requests](#how-to-fork-and-open-pull-requests)
- [Styling guidelines](#styling-guidelines)
- [Starting the project](#starting-the-project)

&nbsp;

## Reporting an Issue
Found a bug/error?  
Please report it by creating an [issue](https://github.com/wardrobe-hq/wardrobe/issues/new/choose). I'll respond as soon as possible.  
If you've got a feature request instead, you can choose the "Feature request" template.
  
If you have any questions, please open a [Q&A discussion](https://github.com/wardrobe-hq/wardrobe/discussions/new?category=q-a) instead!

&nbsp;

## How to fork and open pull requests
To contribute code to the project, you first need to fork this repository. Go to the main page of this repository and click on the "Fork" button in the top right.  
After waiting a few seconds you should now have a *copy* of the repository on your account.

Assuming you already have `git` installed on your computer, open a folder on your PC where the project should be stored.  
Open a terminal in this location and run the command  
`git clone https://github.com/your-username/wardrobe`  
...or use any other Git Client of your choice.

You can now create your own branch using `git checkout -b "branchname"`, make changes and commit them to it.  
It makes sense to give the branch a sensible name based on what your changes will be, but no pressure.

Once you have made your changes and verified they are working as expected, you need to open a Pull Request to get them merged into this repository.  
[Click here](https://github.com/wardrobe-hq/wardrobe/compare/), click on "Compare across forks" at the top and select `base: master` on the left side.  
Then, choose your fork on the right at `head repository:`, your branch at `compare:` and click on "Create Pull Request".

Give your pull request a fitting title which describes your changes in a few words and put a more in depth explanation below in the description.  
Once you're satisfied, hit the "Create pull request" button below to submit.  
I'll take a look at it in the following few days.  
Once everything looks good, I will merge your changes and they will be included in the next version.

&nbsp;

## Styling Guidelines
Please make sure your code is somewhat good looking, is easy to read and is properly documented.  
Take a look at any of the other source code files in the project to see how I style my code.

The project includes an [eslint config](/.eslint.config.mjs) to enforce the project's styling rules, so please make sure your eslint installation works.  
While working on your code, eslint should automatically display warnings or errors for parts of your code if you are using an IDE.  
To run the linter manually, you can execute the command `npx eslint .` in the project folder.  
Please make sure to fix all eslint errors and warnings before submitting a pull request.

In short, the main styling rules are:
- Spaces for indentation with a size of `4`
- camelCase for variables and functions
- Opening braces on the same line as the if/for/while statement
- Do not omit semicolons at line ends
- Do not use `var` but `let` & `const` instead
- Provide JsDocs for your functions, these are also used to generate typescript bindings later on

&nbsp;

## Starting the project
Open a terminal in the directory you cloned the repository to.  
Make sure you have a somewhat recent version of node & npm installed.

Install all dependencies once using:  
`npm install`

To execute the project during development on your computer, run:  
`npm run dev`

Access wardrobe at `localhost:3000` in your browser.  
The webserver will automatically reload when you make changes.

&nbsp;

## Attribution
When having made changes to a file, please update the file header to:
- contain your name in the list of authors
- have your name set at last modified
- display the current date at last modified

If you've added a new file, please copy, paste and adapt the file header from another file.  
When commiting your changes, you'll automatically be listed as a contributor to this Git project.

Thanks for taking your time!
