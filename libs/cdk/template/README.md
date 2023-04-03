# @angular-kit/cdk/template

A package providing some useful Angular ehancements for templates.

##  🔋 Included
* `*rxIfList` - `*ngIf` for lists.

### `rxIfList`
A structural directive that works like `*ngIf` but for lists. It will only render the template if the list is not empty.

The term list does include: arrays and interables.
```html
<ul>
  <li *rxIfList="[1,2,3]">List is not empty</li>
</ul>
```

