# danger の設計

```mermaid
flowchart
  Start((START))-->TsfileModifiers{"TypeScriptファイルの<br>変更有無"}
  TsfileModifiers-->|なし|end1((終了))
  TsfileModifiers-->|あり|GetNoAbstraction["抽象化対象外の<br>ファイルの一覧の作成"]

  GetNoAbstraction-->|並行処理|GenerateHeadGraph["Head の Graph を生成"]
  GenerateHeadGraph-->FilterHeadGraph["Head の Graphから<br>不要部分を除去"]
  FilterHeadGraph-->GenerateBaseGraph["Base の Graph を生成"]
  GenerateBaseGraph-->FilterBaseGraph["Base の Graphから<br>不要部分を除去"]

  GetNoAbstraction-->|並行処理|GetRename["リネームされたファイルの一覧を取得"]

  ExistsNode{グラフに<br>表示可能な<br>ノードが...}
  ExistsNode-->|ない|TypeScripgGraph非表示-->end2((終了))
  ExistsNode-->|ある|JudgeGraphAmmounts
  FilterBaseGraph-->|待ち合わせ|ExistsNode
  GetRename-->|待ち合わせ|ExistsNode
  JudgeGraphAmmounts{"ファイルの削除<br>またはリネームが..."}

  %% 1つの Graph
  JudgeGraphAmmounts-->|ない|GetDiff["Head と Base の差分を取り<br>ノードやリレーションに<br>ステータスを付与する"]
  GetDiff-->MergeGraph["Head と Base をマージする"]
  MergeGraph-->表示する-->end3((終了))

  %% 2つの Graph
  JudgeGraphAmmounts-->|ある|AddStatusToHead["Head の Graph に<br>ステータスを付与する"]
  AddStatusToHead-->AddStatusToBase["Base の Graph に<br>ステータスを付与する"]
  AddStatusToBase-->Display2Graph["2つの Graph を表示する"]-->end4((終了))


```

- ❓ なぜ Head と Base の Graph 生成を並行処理しないか
  - 👨🏻‍🎓 それぞれのブランチをチェックアウトする必要があるため排他的になる
- ❓ なぜ Graph 生成とリネームファイルの一覧生成は並行処理か
  - 👨🏻‍🎓 リネームファイルの一覧生成は GitHub API を叩いて取得した情報を使うため並行処理が可能
- ❓ なぜ 1 つの Graph と 2 つの Graph が必要なのか
  - 👨🏻‍🎓 その PR での構造の変化の度合いによって、1 つの Graph で見るほうが理解が容易か、2 つの Graph （Before - After）で見るほうが理解が容易かが異なるため
