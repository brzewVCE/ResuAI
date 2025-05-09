from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    # You could pass default markdown text here if you wanted
    # default_markdown = "# Hello\n\nThis is *Markdown*."
    # return render_template('index.html', default_markdown=default_markdown)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)