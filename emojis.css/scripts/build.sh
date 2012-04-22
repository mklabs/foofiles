

for file in $(cat icons.txt); do
  echo """
    » $file
    node scripts/build.js $file --css >> emojis.css
  """
  node scripts/build.js $file --css >> emojis.css || exit 1
  echo "" >> emojis.css
done

