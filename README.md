# AppLinks

When opening an external application link such as `slack://` or `bankid://` Firefox often does not show you the link before opening it, which kinda sucks. Also these links are not saved in the history, making it impossible to track them down if you (for whatever reason need to).

This extension catches all application links, noitfies you that one is about to open and lets you inspect it. Additionally it saves the following data for each link:

- The app link
- Which domain navigated you to the app link
- Date of access

and makes it json exportable, to compensate for the lack of a history entry for these types of links.

## Future improvements

- Block links until they have been inspected and approved (disable auto navigation)
- Warns you when an suspicious origin attempts at launching a application link

## Contributing

Feel free to create PRs and issues with feature requests, bugs, security concerts and more!

## Icons

<a href="https://www.flaticon.com/free-icons/ui" title="ui icons">Ui icons created by GOFOX - Flaticon</a>