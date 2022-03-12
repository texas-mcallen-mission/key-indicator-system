# Why Lodash?

...mainly because it's the single easiest way to make sure that config options get recursively merged properly.  This is also a development time-saver, because it means that this doesn't have to be maintained / developed internally, and since ``lodash`` is so widely used, it's not likely to have problems.

Specifically, we're using this community-maintained version of ``lodash`` compiled for Google AppScript environments- [contributorpw/lodashgs](https://github.com/contributorpw/lodashgs), with a local version copied to this location & shared publicly- *[script.google.com](https://script.google.com/d/1cMT3fBZ9Ak0e6LMQRMtCJEJfDSKx0xpq6l-tJ9gy6jbrHzrUpyyt1JDc/edit?usp=sharing)*

## Example

### Object 1

```js
obj1 = {
    subObj1:{
        property1:"string1",
        property2:"string2",
        property3:"string3"
    },
    property4:"string4"
    property5:"string5"
}
```

### Object 2

```js
obj2 = {
    subObj1:{
        property2:"override2",
        property3:"override3"
    },
    property4:"override4"
    property6:"new_entry6"
}
```

### Combining with dot notation

Input:

```js
wombo_combo = {
    ...obj1,
    ...obj2
}
```

Result:

```js
wombo_combo = {
  subObj1: { 
      property2: 'override2',
      property3: 'override3' 
      },
  property4: 'override4',
  property5: 'string5',
  property6: 'new_entry6'
}
```

### Using lodash

Input:

```js
var _= lodash.load();
wombo_combo =_.merge(obj1,obj2);
```

Result:

```js
wombo_combo = {
    subObj1:    {
        property1: 'string1',
        property2: 'override2',
        property3: 'override3' 
    },
  property4: 'override4',
  property5: 'string5',
  property6: 'new_entry6' 
}
```

This is what we want- notice how in the ``...`` version, ``subObj1.property1`` does not exist.  This is because ``Obj2``'s version of ``subObj1`` *completely replaced* ``Obj1``'s version.  This is not ideal if we want to do something like selectively modify configuration files and allow backwards-compatibility with config options that haven't been updated recently.

Code for example:

* Environment: Google AppScript, with the lodashgs library referenced and named ``lodash``.

```js
var _ = lodash.load(); 
function demoThingy(){
    obj1 = {
        subObj1:{
            property1:"string1",
            property2:"string2",
            property3:"string3"
        },
        property4:"string4",
        property5:"string5"
    }
    obj2 = {
        subObj1:{
            property2:"override2",
            property3:"override3"
        },
        property4:"override4",
        property6:"new_entry6"
    }
    wombo_combo = {
        ...obj1,
        ...obj2
    }
    console.log(wombo_combo)
    wombo_combo_2 =_.merge(obj1,obj2);
    console.log(wombo_combo_2)
}
```
