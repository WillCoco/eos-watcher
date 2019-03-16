<template>
    <div v-bind:id="chartId" style="width:100%;height:284px"></div>
</template>

<script>
  import echarts from 'echarts';

  export default {
    name: "index",
    props: ['accountName', 'accounts', 'index'],
    computed: {
      accountData: function () {
        console.log('this.accounts', this.accounts)
        console.log('this.accountName', this.accountName)
        return {...this.accounts[this.accountName]}
      },
      chartId: function() {
        return `chart-${this.index}`
      }
    },
    watch: {
      // 视图中没有绑定store数据，所以需要watch
      accountData: {
        handler: function (val, oldVal) { /* ... */
          this.myChart.clear();
          this.updateChart();
          // console.log(JSON.stringify(val), oldVal,'watch1010100')
        },
      },
    },
    methods: {
      updateChart() {
        // 图表数据
        const barStyle ={
          barBorderWidth: 1,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0,0,0,0.2)'
        };

        const option = {
          title: {
            text: this.accountName,
            left: 'left'
          },
          xAxis: {
            type: 'category', //坐标轴类型
            boundaryGap: true, //坐标轴 是否两侧留白
            data: Object.keys(this.accountData.data || [])
          },
          yAxis: {
            type: 'value',
            // position: 'right' //坐标轴 靠做还是靠右
          },
          legend: {
            data: ['summary', 'in', 'out'],
            align: 'left',
            left: 'right'
          },
          series: [{
            name: 'summary',
            data: Object.values(this.accountData.data || []).map(d => d.value),
            type: 'line',
            lineStyle: {
              color: '#0085FF', //折线颜色
            },
            symbolSize: 6, //转折点size
            itemStyle: {
              borderColor: '#0085FF'
            },
            areaStyle: { //区域线性
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(0,133,255,0.20)' // 0% 处的颜色
                }, {
                  offset: 1, color: 'rgba(0,133,255,0.00)' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
              }
            },
            smooth: true
          }, {
            name: 'in',
            type: 'bar',
            stack: 'one',
            itemStyle: barStyle,
            barMaxWidth: 50,
            data: Object.values(this.accountData.data || []).map(d => d.in)
          }, {
            name: 'out',
            type: 'bar',
            stack: 'two',
            itemStyle: barStyle,
            barMaxWidth: 50,
            data: Object.values(this.accountData.data || []).map(d => -d.out)
          },]
        };
        this.myChart.setOption(option)
      }
    },
    mounted() {
      this.myChart = echarts.init(document.getElementById(this.chartId));
      this.updateChart();
    },
    updated() {
      console.log('chart update')
    }
  }
</script>

<style scoped>

</style>
