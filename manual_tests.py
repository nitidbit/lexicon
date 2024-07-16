#!/usr/bin/env python3

"""
Fetches a table of things to test for Lexicon, and prints one out at random.

Airtable URL:
    https://airtable.com/appu13VcTqFLIsXGQ/tblGrzxt9QJXbqqdk/viwtbMfTYQX7pvrH1?blocks=hide

Invitation link so anyone @nitidbit.com can gain access:
    https://airtable.com/invite/l?inviteId=invmhNwpxk8HZuGmh&inviteToken=a0bbb20f47e58909c411cfa814664bd1bc62c8bf1edfa85d154954cb354aada7&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts
"""

from subprocess import run, PIPE
from random import choice

try:
    import pyairtable
except ModuleNotFoundError:
    print('\n\n--- Could not import pyairtable. Try "pip3 install pyairtable"\n\n')
    raise

def airtable_rows():
    print('\n\nI\'m asking 1Password for the AIRTABLE_TOKEN...\n\n')
    AIRTABLE_TOKEN = run(
        ['op', 'read', "op://Nitid Staff/Lexicon AIRTABLE_TOKEN/password"], check=True, stdout=PIPE
    ).stdout.strip().decode()

    api = pyairtable.Api(AIRTABLE_TOKEN)
    table = api.table('appu13VcTqFLIsXGQ', 'tblGrzxt9QJXbqqdk')
    results = table.all()
    results = filter(
        lambda row: 'Section' in row['fields'] \
            and 'Summary' in row['fields'] \
            and 'Recipe' in row['fields'],
        results)
    return list(results)


def indent(num_spaces, text):
    return ('\n' + ' ' * num_spaces).join(text.split('\n'))


def print_random_test_procedure():
    all_procedures = airtable_rows()

    print("Picking a random procedure out of", len(all_procedures))
    procedure = choice(all_procedures)

    print("\nPlease test this area:",
        "\n",
        "\n       id:", procedure['id'],
        "\n  SECTION:", procedure['fields']['Section'],
        "\n  SUMMARY:", procedure['fields']['Summary'],
        "\n   RECIPE:", indent( 11, procedure['fields']['Recipe']),
        "\n",
         )


if __name__=='__main__':
    print_random_test_procedure()

