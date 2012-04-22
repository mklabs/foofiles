https://github.com/api/v2/json/blob/all/arvida/emoji-cheat-sheet.com/master



What follows is the result of running `b64` utility on top of icons stored in
<a href="https://github.com/arvida/emoji-cheat-sheet.com">
arvida/emoji-cheat-sheet.com repository.
</a>

Big thanks to <a href="http://arvidandersson.se/">Arvid Andersson</a>.</p>


Detailed information: <a href="http://www.emoji-cheat-sheet.com/">http://www.emoji-cheat-sheet.com/</a>


---

Run `make` to rebuild the entire CSS plus index.html file.

**scripts/build.sh**

```sh
for file in $(cat icons.txt); do
  echo """
    » $file
    b64 $file --css >> emojis.css
  """
  node b64 $file --css >> emojis.css || exit 1
  echo "" >> emojis.css
done
```

