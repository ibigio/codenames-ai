def to_str(game):
    return ((','.join([''.join(line.split(' ')[2:]) for line in game.split('\n')[1:]])).split(','))


IN = """

Red Words: mouse, mint, pirate, table, band
Blue Words: crown, shop, smuggler, centaur, fair, tick
Neutral Words: organ, cat, dog, block, head
Black Word: fence

"""

# game = IN.strip()
# a = to_str(game)
# print(', '.join(sorted(a)))

def convert_remaining(chunk):
    words = to_str(chunk)
    return f"Remaining Words: {', '.join(sorted(words))}"


def convert_hint(chunk):
    lines = chunk.split("\n")
    though_process = lines[1].split(":")[1].strip()
    intended_words = lines[2].split(":")[1].strip()
    hint = lines[3].split(":")[1].strip()
    return f"""{lines[0].strip()}: {hint}
Thought Process: {though_process}
Final Guess: {intended_words}"""



def convert_chunk(chunk):
    lines = chunk.split("\n")

    if "Hint" in lines[0]:
        return convert_hint(chunk)
    elif "Remaining" in lines[0]:
        return convert_remaining(chunk)
    else:
        print(f"Chunk starting with \"{lines[0]}\" not recognized")
        raise "bad chunk"


def convert_game():
    with open("prompt.txt") as f:
        game = f.read()
    g = game.split('\n\n')
    
    print(g[0])
    print()
    for x in g[1:]:
        # print()
        # print(x)
        # print()
        print(convert_chunk(x))
        print()

convert_game()