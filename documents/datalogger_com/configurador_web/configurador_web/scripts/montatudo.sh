#!/bin/ash

for i in *.html
do
	echo "<div id='$i'>"
	cat $i
	echo "</div> <!-- fim div $i -->"
done
