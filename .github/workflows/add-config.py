import sys

nameOfScript = sys.argv[0]
commandLineArgs = sys.argv[1]

argumentString = str(commandLineArgs).replace('\\n', '\n').replace('\\t', '\t')

numArgs = len(sys.argv)

print(nameOfScript," arguments: ",numArgs)


file_in = open("git-info.js", "rt")

inputLines = file_in.readlines()
file_in.close()

file_out = open("git-info.js","wt")

for line in inputLines:
    line_out = line.replace('//PYTHON_STICKS_CONFIG_DATA_HERE', argumentString)
    file_out.write(line_out)

file_out.close()