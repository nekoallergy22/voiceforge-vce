# 見出し

・ヘッダ部分にカラム名を小さな文字で付与する　：　No, Text, {ボタン2つはスキップして}, Slide No, Contents No
・空の行は無視する。ただし、UI上は少し間隔をあける。右の行数は、空行をスキップして1，2，3と付与する
・Slide No, Contents Noは0以上の整数に制限（Contents Noはひとまずすべて0で埋めて）
・Slide Noのあるセルを選択した状態でTabキーを押すと、次の行のSlide Noセルに移行する

・Slide No, Contents Noの幅を短くして（数値4桁分くらい）
・空行は、そもそもテキストボックスやボタンなど何も配置しないようにして。（ただし、間隔を少し開けるように。）
・Slide Noは、下記のような処理にして。

SlideNoの処理：
・数値を変更したセルに対して、それ以降の行をすべてそのセルの数値にする
・たとえば、No3のセルを4にしたら、No4，5，6は全て4に自動で切り替える
・同様に、No10のセルを7にしたら、それ以降の11,12,13,,は全て7になる

・SlideNoセルは現状のまま、セルを選択したときに表示される上下の数値調整UIは消せる？（現状の機能はそのまま）
・Contents Noは、編集不可にして、SlideNoに従って自動で入力される。

Contents Noの挙動：
・基本的に1以上の自然数でインクリメントしていく（1, 2, 3, 4, , ,）
・ただし、SlideNoの切り替わりタイミングでリセットされる。

例：
S, C
0, 1
0, 2
0, 3
1, 1 : SlideNoが切り替わったので、Contents Noは1からスタート
1, 2
2, 1 : 同様


・空行は間隔をあけるようになっているが、UIはそのままで、内部では空行として扱って。（理由は、UI上でSAVEした際にMDファイルの空行が削除されてしまうから。）
・Contents Noもセルを選択したときに表示される上下の数値調整UIを消して。（現状の機能はそのまま）
・MD記法である、# や ## などの見出し文字が検出されたら、テキストボックスの外に出し、見出しとして扱って。
（例：# これは見出しです　という行は、「これは見出しです」というテキストを、テキストボックスの外のUI上に記載）

・見出しの行は、ボタンとSlideNo、Contents Noを削除
・空行は、内部では空行として保持しつつ、UIでは何も表示しないで。（テキストボックス、ボタンなどのUIは不要）